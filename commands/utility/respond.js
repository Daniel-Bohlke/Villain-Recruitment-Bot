const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Player, Game, getGame, findPlayer, saveGame, directMessageUser } = require('../../helper-function.js');


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
		var game = getGame(interaction);
		if(game === null){
			var response = 'Error - The game has not been started.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
			return;
		}
		var player = findPlayer(game.players, interaction.user.id);
		if(player === null){
			var response = 'Error - You are not a player in the game.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
			return;
		}
		else if(player.beingRecruited){
			if(game != null){
				if(interaction.options.getSubcommand() === 'accept'){
					console.log('accepted');
					player.isVillain = true;
					directMessageUser(interaction, "Your recruitment of player: " + player.user.username + " has been accepted and they are now a villain.", game.recruitingPlayer.user.id);
				}
				else if(interaction.options.getSubcommand() === 'decline'){
					console.log('declined');
					directMessageUser(interaction, "Your recruitment of player: " + player.user.username + " has been rejected and they will remain a hero.", game.recruitingPlayer.user.id);
				}
				player.beingRecruited = false;
				game.players[player.index] = player;
				game.pendingResponse = false;
				game.villainActionReady = false;
				saveGame();
			}
		}
		else{
			if(player === null){
				var response = 'Error - You are not a player in the game.';
				await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
			}
			else{
				var response = 'Error - You are not being recruited.';
				await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
			}
		}
		//var username = interaction.options.getUser('user').username;
		//var userID = interaction.options.getUser('user').id;
		//await interaction.client.users.send(userID, "You are being recruited by a villain, please use the \"respond\" function to respond.");
		//var response = 'You have attempted to recruit user: ' + username;
		//await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		//await interaction.deleteReply();
	},
};