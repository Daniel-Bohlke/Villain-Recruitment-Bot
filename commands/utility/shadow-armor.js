const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Player, Game, getGame, findPlayer, saveGame, directMessageUser } = require('../../helpers.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('shadowArmor')
		.setDescription('Grants Shadow Armor to a player.')
		.addUserOption(option =>
		option.setName('user')
			.setDescription('The user you would like to give the Shadow Armor to.')
			.setRequired(true)),
	async execute(interaction) {
		var game = getGame(interaction);
		if(game === null){
			return;
		}
		var username = interaction.options.getUser('user').username;
		var userID = interaction.options.getUser('user').id;
		//Is the requesting person a villain and is the targeted person a Hero?
		var giftingPlayer = findPlayer(game.players, interaction.user.id);
		var targetedPlayer = findPlayer(game.players, userID);;
		if(giftingPlayer === null){
			//Is the requesting person even in the game?
			var response = 'Error - You are not a player in the game.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(targetedPlayer === null){
			//Is the targeted person even in the game?
			var response = 'Error - User: ' + username + ' is not a player in the game';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(giftingPlayer.isVillain){
			var response = 'Error - You are a Villain.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(!giftingPlayer.isDead){
			var response = 'Error - You are not dead.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(game.villainActionReady){
			var response = 'Error - It is currently the Villains' turn to act.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(targetedPlayer.isDead){
			var response = 'Error - The chosen player is dead.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}		
		else if(!game.grantingShadowArmor){
			var response = 'Error - Shadow Armor cannot be granted at this time.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else if(!giftingPlayer.canGrantShadowArmor){
			var response = 'Error - You are not the player authorized to grant Shadow Armor at this time.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else{
			giftingPlayer.canGrantShadowArmor = false;
			//make sure nobody else has Shadow Armor
			game.players.forEach((player) => player.shadowArmor = false);
			targetedPlayer.shadowArmor = true;
			game.villainActionReady = true;
			game.players[giftingPlayer.index] = giftingPlayer;
			game.players[targetedPlayer.index] = targetedPlayer;
			saveGame();
			directMessageUser(interaction, "You have been granted the Shadow Armor and cannot die until another Hero dies.", userID);
			var response = 'You have granted the Shadow Armor to: ' + username;
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
			response = 'The Shadow Armor has been granted. The game may now continue.';
			await interaction.reply({ content: response });
			//console.log(interaction.client.text);
		}
		//await interaction.deleteReply();
	},
};