const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Player, Game, getGame, findPlayer, saveGame, directMessageUser } = require('../../helpers.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('recruit')
		.setDescription('Recruits a Villain.')
		.addUserOption(option =>
		option.setName('user')
			.setDescription('The user you would like to recruit')
			.setRequired(true)),
	async execute(interaction) {
		var game = getGame(interaction);
		if(game === null){
			return;
		}
		var username = interaction.options.getUser('user').username;
		var userID = interaction.options.getUser('user').id;
		//Is the requesting person a villain and is the targeted person a Hero?
		var isVillain = false;
		var recruitingPlayer = findPlayer(game.players, interaction.user.id);
		var targetedPlayer = findPlayer(game.players, userID);;
		if(!recruitingPlayer.isVillain){
			var response = 'Error - You are not a Villain.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(recruitingPlayer.isDead){
			var response = 'Error - You are dead and cannot recruit.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(targetedPlayer.isVillain){
			var response = 'Error - The target is not a Hero.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(targetedPlayer.isDead){
			var response = 'Error - The chosen player is dead.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}		
		else if(recruitingPlayer === null){
			//Is the requesting person even in the game?
			var response = 'Error - You are not a player in the game.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(targetedPlayer === null){
			//Is the targeted person even in the game?
			var response = 'Error - User: ' + username + ' is not a player in the game';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		else if(game.numVillains === game.maxVillains){
			//Are the max number of villains are already in the game?
			var response = 'The max number of villains has currently been reached.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else{
			game.recruitingPlayer = recruitingPlayer;
			game.players[targetedPlayer.index] = targetedPlayer;
			saveGame();
			directMessageUser(interaction, "You are being recruited by a villain, please use the \"respond\" function in your server to respond.", userID);
			var response = 'You have attempted to recruit user: ' + username;
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
			//console.log(interaction.client.text);
		}
		//await interaction.deleteReply();
	},
};