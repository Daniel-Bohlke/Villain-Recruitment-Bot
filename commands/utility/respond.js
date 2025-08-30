const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getGame, findPlayer, saveGame, directMessageUser } = require('../../helpers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('respond')
        .setDescription('Responds to Villain Recruitment.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('accept-recruitment')
                .setDescription('Accept the recruitment and become a Villain.')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('decline-recruitment')
                .setDescription('Decline the recruitment and remain a Hero.')
        ),

    async execute(interaction) {
        const game = getGame(interaction);
        if (!game) return this.error(interaction, 'Error - The game has not been started.');

        const player = findPlayer(game.players, interaction.user.id);
        if (!player) return this.error(interaction, 'Error - You are not a player in the game.');

        if (!player.beingRecruited) {
            return this.error(interaction, 'Error - You are not currently being recruited.');
        }

        const recruiter = game.recruitingPlayer;
        const accepted = interaction.options.getSubcommand() === 'accept-recruitment';

        if (accepted) {
            player.isVillain = true;
            game.numVillains++;

            // Notify recruiter
            directMessageUser(interaction, recruiter.user.id, {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00FF00)
                        .setTitle('✅ Recruitment Accepted')
                        .setDescription(`Your recruitment of **${player.user.username}** was successful — they are now a Villain! 😈`)
                        .setTimestamp()
                ]
            });

            // Notify new villain
            directMessageUser(interaction, player.user.id, {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x8B0000)
                        .setTitle('😈 You Have Joined the Villains')
                        .setDescription('You have accepted the recruitment offer and are now aligned with the Villains. Play wisely...')
                        .setTimestamp()
                ]
            });

            // Notify other villains
            game.players
                .filter(p => p.isVillain && !p.isDead && p.index !== recruiter.index && p.index !== player.index)
                .forEach(villain => {
                    directMessageUser(interaction, villain.user.id, {
                        embeds: [
                            new EmbedBuilder()
                                .setColor(0x8B0000)
                                .setTitle('🩸 Villain Ranks Grow')
                                .setDescription(`**${player.user.username}** has joined our cause.`)
                                .setTimestamp()
                        ]
                    });
                });

        } else {
            // Declined recruitment
            directMessageUser(interaction, recruiter.user.id, {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0xFF0000)
                        .setTitle('❌ Recruitment Declined')
                        .setDescription(`Your recruitment of **${player.user.username}** was rejected. They remain a Hero.`)
                        .setTimestamp()
                ]
            });

            directMessageUser(interaction, player.user.id, {
                embeds: [
                    new EmbedBuilder()
                        .setColor(0x00AE86)
                        .setTitle('🛡️ Recruitment Refused')
                        .setDescription('You declined the recruitment offer and remain a Hero.')
                        .setTimestamp()
                ]
            });
        }

        // Reset recruitment state
        player.beingRecruited = false;
        game.players[player.index] = player;
        game.pendingResponse = false;
        game.villainActionReady = false;
        saveGame(interaction, game);

        // Public vague message to keep secrecy
        await interaction.reply({
            content: '💤 The night passes quietly...',
        });
    },

    error(interaction, message) {
        return interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
    }
};
