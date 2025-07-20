const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Initiates a game of Heroes and Villains.')
		.addUserOption(option =>
		option.setName('player1')
			.setDescription('Player 1')
			.setRequired(true)),
			.addUserOption(option =>
		option.setName('player2')
			.setDescription('Player 2')
			.setRequired(true)),
			.addUserOption(option =>
		option.setName('player3')
			.setDescription('Player 3')
			.setRequired(true)),
			.addUserOption(option =>
		option.setName('player4')
			.setDescription('Player 4')
			.setRequired(true)),
			.addUserOption(option =>
		option.setName('player5')
			.setDescription('Player 5')
			.setRequired(true)),
			.addUserOption(option =>
		option.setName('player6')
			.setDescription('Player 6')
			.setRequired(true)),
			.addUserOption(option =>
		option.setName('player7')
			.setDescription('Player 7')
			.setRequired(true)),
	async execute(interaction) {
		var username = interaction.options.getUser('user').username;
		var userID = interaction.options.getUser('user').id;
		await interaction.client.users.send(userID, "You are being recruited by a villain, please use the \"respond\" function to respond.");
		var response = 'You have attempted to recruit user: ' + username;
		await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		console.log(interaction.client.text);
		//await interaction.deleteReply();
	},
};