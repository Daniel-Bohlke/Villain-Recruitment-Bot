const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getGame, findPlayer, saveGame, directMessageUser } = require('../../helpers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recruit')
        .setDescription('Recruits a Villain.')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you would like to recruit')
                .setRequired(true)
        ),

    async execute(interaction) {
        const game = getGame(interaction);
        if (!game) return this.error(interaction, 'Error - The game has not been started.');

        const targetUser = interaction.options.getUser('user');
        const recruiter = findPlayer(game.players, interaction.user.id);
        const target = findPlayer(game.players, targetUser.id);

        // Validation checks
        if (game.pendingResponse) return this.error(interaction, 'Error - Villain Actions are not available yet.');
        if (!recruiter) return this.error(interaction, 'Error - You are not a player in the game.');
        if (!target) return this.error(interaction, `Error - User: ${targetUser.username} is not a player in the game.`);
        if (!game.villainActionReady) return this.error(interaction, 'Error - The Villain team has already acted this round.');
        if (!recruiter.isVillain) return this.error(interaction, 'Error - You are not a Villain.');
        if (recruiter.isDead) return this.error(interaction, 'Error - You are dead and cannot recruit.');
        if (target.isVillain) return this.error(interaction, 'Error - The target is not a Hero.');
        if (target.isDead) return this.error(interaction, 'Error - The chosen player is dead.');
        if (game.numVillains === game.maxVillains) return this.error(interaction, 'The max number of villains has currently been reached.');

        // Recruitment process
        game.recruitingPlayer = recruiter;
        target.beingRecruited = true;
        game.players[target.index] = target;
        game.pendingResponse = true;
        saveGame(interaction, game);

        // DM the target
        directMessageUser(interaction, targetUser.id, {
            embeds: [
                new EmbedBuilder()
                    .setColor(0x8B0000)
                    .setTitle('😈 Recruitment Attempt')
                    .setDescription(
                        `A mysterious figure has approached you in the shadows...\n\n` +
                        `You are being **recruited by a Villain**.\nUse the **/respond** command in your server to accept or refuse.`
                    )
                    .setFooter({ text: 'Choose wisely — your decision will change the game.' })
                    .setTimestamp()
            ]
        });

        // Notify all living villains (including recruiter) of the attempt
        const livingVillains = game.players.filter(p => p.isVillain && !p.isDead);
        livingVillains.forEach(villain => {
            directMessageUser(interaction, villain.user.id, {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x8B0000)
                        .setTitle('🩸 Villain Recruitment in Progress')
                        .setDescription(`**${recruiter.user.username}** is attempting to recruit **${targetUser.username}**.`)
                        .setTimestamp()
                ]
            });
        });

        // Confirmation to recruiter
        await interaction.reply({
            content: `You have attempted to recruit **${targetUser.username}**. Await their response.`,
            flags: MessageFlags.Ephemeral
        });
    },

    error(interaction, message) {
        return interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
    }
};
