const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Player, Game, getGame, findPlayer, saveGame, directMessageUser } = require('../../helpers.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('eliminate')
		.setDescription('Publicly kills a player.')
		.addUserOption(option =>
		option.setName('user')
			.setDescription('The user to be eliminated. WARNING - THIS ACTION CANNOT BE UNDONE.');
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
		var targetedPlayer = findPlayer(game.players, userID);
		if(targetedPlayer.isDead){
			var response = 'Error - The chosen player is dead.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}		
		else if(targetedPlayer === null){
			//Is the targeted person even in the game?
			var response = 'Error - User: ' + username + ' is not a player in the game';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else{
			if(targetedPlayer.isVillain){
				game.numVillains--;
			}
			targetedPlayer.isDead = true;
			game.players[targetedPlayer.index] = targetedPlayer;
			saveGame();
			var response = 'The following player has been eliminated and is now dead: ' + username + '\n\nBest hope you chose wisely...';
			await interaction.reply({ content: response });
			//console.log(interaction.client.text);
		}
		//await interaction.deleteReply();
	},
};