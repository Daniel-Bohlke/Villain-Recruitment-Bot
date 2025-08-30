const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('marco')
        .setDescription('Replies with Polo to test connection and latency'),

    async execute(interaction) {
        const responses = [
            'Polo! 🏊‍♂️',
            'Right here! 👋',
            'Did someone call Marco? 🦆',
            'Polo! But watch out for sharks 🦈'
        ];

        const start = Date.now();
        await interaction.deferReply();
        const latency = Date.now() - start;

        const embed = new EmbedBuilder()
            .setColor(0x00AE86)
            .setTitle('🏓 Marco!')
            .setDescription(`${responses[Math.floor(Math.random() * responses.length)]}`)
            .addFields({ name: 'Latency', value: `${latency}ms`, inline: true })
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    },
};
