const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('respond')
		.setDescription('Responds to Villain Recruitment.')
		.addSubcommand(subcommand =>
            subcommand
                .setName('accept-recruitment')
                .setDescription('Accept the recruitment and become a Villain.'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('decline-recruitment')
                .setDescription('Decline the recruitment and remain a Hero.')),
	async execute(interaction) {
		if(interaction.options.getSubcommand() === 'accept'){
			console.log('accepted');
		}
		else if(interaction.options.getSubcommand() === 'decline'){
			console.log('declined');
		}
		//var username = interaction.options.getUser('user').username;
		//var userID = interaction.options.getUser('user').id;
		//await interaction.client.users.send(userID, "You are being recruited by a villain, please use the \"respond\" function to respond.");
		//var response = 'You have attempted to recruit user: ' + username;
		//await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		//await interaction.deleteReply();
	},
};