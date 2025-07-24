const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Player, Game, getGame, findPlayer, saveGame, directMessageUser, endGame } = require('../../helpers.js');


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
		var requestingPlayer = findPlayer(game.players, interaction.user.id);
		var targetedPlayer = findPlayer(game.players, userID);
		if(game.villainActionReady){
			var response = 'Error - It is currently the Villains' turn to act.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(requestingPlayer === null){
			//Is the person using this even in the game?
			var response = 'Error - you are not a player in the game';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(requestingPlayer.isDead){
			var response = 'Error - Only living players may perform this command.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}	
		else if(targetedPlayer === null){
			//Is the targeted person even in the game?
			var response = 'Error - User: ' + username + ' is not a player in the game';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(targetedPlayer.isDead){
			var response = 'Error - The chosen player is dead.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}		
		else{
			var response = 'The following player has been eliminated and is now dead: ' + username + '\n\n';
			targetedPlayer.isDead = true;
			game.livingPlayers--;
			game.players[targetedPlayer.index] = targetedPlayer;
			if(targetedPlayer.isVillain){
				game.numVillains--;
				response = response + 'The eliminated player was a villain.';
				game.villainActionReady = true;
				if(game.numVillains === 0){
					response = response + '\n\nCongratulations! The final Villain has been eliminated and the heroes have won the game! Justice has been served.';
					endGame(interaction);
				}
			}
			else{
				response = response + 'The eliminated player was a hero.';
				targetedPlayer.canGrantShadowArmor = true;
				game.grantingShadowArmor = true;
				if(game.numVillains > game.livingPlayers){
					response = response + '\n\nThe Villains have won as they now outnumber the surviving Heroes! On this day, evil reigns supreme.';
					endGame(interaction);
				}
			}
			saveGame();
			await interaction.reply({ content: response });
			//console.log(interaction.client.text);
		}
		//await interaction.deleteReply();
	},
};