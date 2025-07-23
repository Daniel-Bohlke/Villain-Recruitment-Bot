const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Player, Game, getGame, findPlayer, saveGame, directMessageUser } = require('../../helpers.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('assassinate')
		.setDescription('Assassinates a Hero')
		.addUserOption(option =>
		option.setName('user')
			.setDescription('The user you would like to assassinate. WARNING - THIS ACTION CANNOT BE UNDONE.')
			.setRequired(true)),
	async execute(interaction) {
		var game = getGame(interaction);
		if(game === null){
			var response = 'Error - The game has not been started.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
			return;
		}
		var username = interaction.options.getUser('user').username;
		var userID = interaction.options.getUser('user').id;
		//Is the requesting person a villain and is the targeted person a Hero?
		var assassinatingPlayer = findPlayer(game.players, interaction.user.id);
		var targetedPlayer = findPlayer(game.players, userID);;
		if(!assassinatingPlayer.isVillain){
			var response = 'Error - You are not a Villain.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(game.pendingResponse){
			var response = 'Error - A player is currently being recruited.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(!game.villainActionReady){
			var response = 'Error - The Villain team has already acted this round.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(assassinatingPlayer.isDead){
			var response = 'Error - You are dead and cannot assassinate.';
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
		else if(assassinatingPlayer === null){
			//Is the requesting person even in the game?
			var response = 'Error - You are not a player in the game.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(targetedPlayer === null){
			//Is the targeted person even in the game?
			var response = 'Error - User: ' + username + ' is not a player in the game';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(targetedPlayer.shadowArmor){
			//Does the targeted player have Shadow Armor?
			var response = 'Your attempted assassination of User: ' + username + ' has failed! As they possess the Shadow Armor!';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
			game.villainActionReady = false;
			saveGame();
		}
		else{
			targetedPlayer.isDead = true;
			game.villainActionReady = false;
			game.players[targetedPlayer.index] = targetedPlayer;
			saveGame();
			var response = 'The following player has been assassinated! : ' + username + '\n\nYour death will be avenged.";
			await interaction.reply({ content: response });
			//console.log(interaction.client.text);
		}
		//await interaction.deleteReply();
	},
};