const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const { getGame, findPlayer, saveGame, directMessageUser } = require('../../helpers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('assassinate')
        .setDescription('Assassinates a Hero')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('The user you would like to assassinate. WARNING - THIS ACTION CANNOT BE UNDONE.')
                .setRequired(true)
        ),

    async execute(interaction) {
        const game = getGame(interaction);
        if (!game) return this.error(interaction, 'Error - The game has not been started.');
		
		// ✅ Acknowledge immediately
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('user');
        const assassin = findPlayer(game.players, interaction.user.id);
        const target = findPlayer(game.players, targetUser.id);

        // Validation checks
        if (!assassin) return this.error(interaction, 'Error - You are not a player in the game.');
        if (!target) return this.error(interaction, `Error - User: ${targetUser.username} is not a player in the game.`);
        if (!assassin.isVillain) return this.error(interaction, 'Error - You are not a Villain.');
        if (game.pendingResponse || game.grantingShadowArmor) return this.error(interaction, 'Error - Villain Actions are not available yet.');
        if (!game.villainActionReady) return this.error(interaction, 'Error - The Villain team has already acted this round.');
        if (assassin.isDead) return this.error(interaction, 'Error - You are dead and cannot assassinate.');
        if (target.isVillain) return this.error(interaction, 'Error - The target is not a Hero.');
        if (target.isDead) return this.error(interaction, 'Error - The chosen player is dead.');

        // Shadow Armor block
        if (target.shadowArmor) {
            game.villainActionReady = false;
            saveGame(interaction, game);

            // Notify all villains (including assassin)
            this.notifyVillains(game, interaction, {
                title: '🛡️ Assassination Blocked',
                description: `An attempt on **${targetUser.username}** was blocked by **Shadow Armor**.`,
                color: 0x808080
            });

            // Public vague message
            await interaction.channel.send(`💤 The night passes quietly...`);
            return;
        }

        // Successful assassination
        target.isDead = true;
        target.canGrantShadowArmor = true;
        game.players[target.index] = target;
        game.villainActionReady = false;
        game.grantingShadowArmor = true;
        saveGame(interaction, game);

        // Notify all villains (including assassin)
        this.notifyVillains(game, interaction, {
            title: '💀 Assassination Complete',
            description: `**${targetUser.username}** has been **assassinated**.\n\n` +
                `They must now grant the Shadow Armor to a living player.`,
            color: 0xFF0000
        });

        // Public vague message
        await interaction.channel.send(`☠️ A player has been slain during the night...`);
    },

    error(interaction, message) {
        return interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
    },

    notifyVillains(game, interaction, { title, description, color }) {
        const livingVillains = game.players.filter(p => p.isVillain && !p.isDead);

        livingVillains.forEach(villain => {
            directMessageUser(interaction, villain.user.id, {
                embeds: [
                    new EmbedBuilder()
                        .setColor(color)
                        .setTitle(title)
                        .setDescription(description)
                        .setTimestamp()
                ]
            });
        });
    }
};
