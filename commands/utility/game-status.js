const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getGame } = require('../../helpers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game-status')
        .setDescription('Shows the current living and dead players in the game.'),

    async execute(interaction) {
        const game = getGame(interaction);
        if (!game) {
            return interaction.reply({ content: 'Error - The game has not been started.' });
        }

        // Separate alive and dead lists with emojis
        const alivePlayers = game.players
            .filter(p => !p.isDead)
            .map(p => `🟢 ${p.user.username}`)
            .join('\n') || 'None';

        const deadPlayers = game.players
            .filter(p => p.isDead)
            .map(p => `🔴 ${p.user.username}`)
            .join('\n') || 'None';

        // Determine current game phase/status
        let statusMessage = '';
        if (game.villainActionReady || game.pendingResponse) {
            statusMessage = 'Currently waiting for Villains to act.';
        } else if (game.grantingShadowArmor) {
            statusMessage = 'Currently waiting for Shadow Armor to be granted.';
        } else {
            statusMessage = 'Currently Discussing/Voting for elimination.';
        }

        // Create embed
        const embed = new EmbedBuilder()
            .setTitle('📝 Game Status')
            .setDescription(statusMessage)
            .setColor(0x00AE86) // nice teal
            .addFields(
                { name: 'Alive Players', value: alivePlayers, inline: true },
                { name: 'Dead Players', value: deadPlayers, inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
