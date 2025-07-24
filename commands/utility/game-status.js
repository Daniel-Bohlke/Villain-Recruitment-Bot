const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Player, Game, getGame, findPlayer, saveGame, directMessageUser } = require('../../helpers.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('game-status')
		.setDescription('Shows the current living and dead players in the game.'),
	async execute(interaction) {
		var game = getGame(interaction);
		if(game === null){
			var response = 'Error - The game has not been started.';
			await interaction.reply({ content: response });
			return;
		}
		var deadList = '';
		var livingList = '';
		game.players.forEach((player) => 
			if(player.isDead){
				deadList = deadList + player.user.username + '\n';
			}
			else{
				livingList = livingList + player.user.username + '\n';
			}
		);
		var response = 'The following players are still alive: \n' + livingList + '\nWhile the following players have all passed on: \n' + deadList;
		await interaction.reply({ content: response });
		//await interaction.deleteReply();
	},
};