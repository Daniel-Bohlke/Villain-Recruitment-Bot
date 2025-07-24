const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Player, Game, getGame, findPlayer, saveGame, directMessageUser } = require('../../helpers.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('my-status')
		.setDescription('Shows your current status in the game if you are playing.'),
	async execute(interaction) {
		var game = getGame(interaction);
		if(game === null){
			var response = 'Error - The game has not been started.';
			await interaction.reply({ content: response });
			return;
		}
		var player = findPlayer(game.players, interaction.user.id);
		if(player === null){
			//Is the requesting person even in the game?
			var response = 'Error - You are not a player in the game.';
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		else{
			var alignment = player.isVillain ? 'Villain' : 'Hero';
			var alive = player.isDead ? 'Dead' : 'Alive';
			var response = 'You are a ' + alignment + '\nYou are currently ' + alive + '\n';
			if(player.isVillain){
				var fellowVillainList = '';
				game.players.forEach((player) => if(player.isVillain){fellowVillainList += '\n- ' + player.user.username + ' (' + (player.isDead ? 'Dead' : 'Alive') + ')';});
				response += '\nYour current fellow Villains are: ' + fellowVillainList;
			}
			await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		}
		//await interaction.deleteReply();
	},
};