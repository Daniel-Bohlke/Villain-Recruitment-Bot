const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('marco')
		.setDescription('Replies with Polo to test connection'),
	async execute(interaction) {
		await interaction.reply('Polo!');
	},
};