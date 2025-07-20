const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('recruit')
		.setDescription('Recruits a Villain.')
		.addUserOption(option =>
		option.setName('user')
			.setDescription('The user you would like to recruit')
			.setRequired(true)),
	async execute(interaction) {
		var username = interaction.options.getUser('user').username;
		var userID = interaction.options.getUser('user').id;
		await interaction.client.users.send(userID, "You are being recruited by a villain, please use the \"respond\" function in your server to respond.");
		var response = 'You have attempted to recruit user: ' + username;
		await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		console.log(interaction.client.text);
		//await interaction.deleteReply();
	},
};