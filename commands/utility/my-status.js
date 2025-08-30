const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { getGame, findPlayer } = require('../../helpers.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('my-status')
        .setDescription('Shows your current status in the game if you are playing.'),

    async execute(interaction) {
        // Get game
        const game = getGame(interaction);
        if (!game) {
            return interaction.reply({
                content: 'Error - The game has not been started.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Get player
        const player = findPlayer(game.players, interaction.user.id);
        if (!player) {
            return interaction.reply({
                content: 'Error - You are not a player in the game.',
                flags: MessageFlags.Ephemeral
            });
        }

        // Basic info
        const alignment = player.isVillain ? 'Villain' : 'Hero';
        const aliveStatus = player.isDead ? 'Dead' : 'Alive';
        let response = `You are a **${alignment}**\nYou are currently **${aliveStatus}**\n`;

        // Villain-specific info
        if (player.isVillain) {
            const fellowVillains = game.players
                .filter(p => p.isVillain && p.index !== player.index)
                .sort((a, b) => Number(a.isDead) - Number(b.isDead)) // Alive first
                .map(p => {
                    const statusColor = p.isDead ? '🔴' : '🟢';
                    return `${statusColor} ${p.user.username} (${p.isDead ? 'Dead' : 'Alive'})`;
                });

            const fellowVillainList = fellowVillains.length
                ? `\n${fellowVillains.join('\n')}`
                : '\nNone, you are the only Villain';

            response += `\nYour current fellow Villains are:${fellowVillainList}`;
        }

        // Send message
        await interaction.reply({
            content: response,
            flags: MessageFlags.Ephemeral
        });
    },
};
