const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Player, Game, saveGame, directMessageUser } = require('./helpers.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Initiates a TEST game of Heroes and Villains. Note that your user ID will be used for all players.')
		.addNumberOption(option =>
		option.setName('numPlayers')
			.setDescription('Number of Players to put in the test game.')
			.setRequired(true)),
	async execute(interaction) {
		//Initialize an array of Players
		var playerCount = interaction.options.getNumber('numPlayers');
		var players = []; 
		var villains = [];
		var villainsList = '';
		for(let i = 0; i < playerCount; i++){
			let playerNumber = i + 1;
			playerCount++;
			let name = 'Player ' + playerNumber;
			let user = { 'username' : name, 'id' : interaction.user.id }
			players.push(new Player(user, i));
			console.log("Player Added");
		}
		var numVillains = 0;
		var maxVillains = 0;
		//Randomly determine the number of max Villains based on Player Count (Max 2 w/10, 3 w/15, 4 w/20 and 5 w/25) with 25 being the max player count.
		if(playerCount >= 8 && playerCount <= 10){
			maxVillains = 2;
		}
		else if(playerCount > 10 && playerCount <= 15){
			maxVillains = 3;
		}
		else if(playerCount > 15 && playerCount <= 20){
			maxVillains = 4;
		}
		else if(playerCount > 20 && playerCount <= 25){
			maxVillains = 5;
		}
		else{
			throw new Error("Error - Player count is incorrect, expected a player count between 8-25 but got: " + playerCount.toString());
		}
		numVillains = getRandomInt(1, maxVillains);
		//Randomly select the villains for the game, skipping over players that have already been selected as villains;
		for(let i = 0; i < numVillains; i++){
			let villainAssigned = false;
			while(!villainAssigned){
				let randomPlayer = getRandomInt(0, playerCount - 1);
				if(!players[i].isVillain){
					players[i].isVillain = true;
					villainAssigned = true;
					villains.push(players[i]);
					villainsList = villainsList + '\n' + players[i].user.username;
				}
			}				
		}
		villains.forEach((villain) => directMessageUser(interaction, 'You are a villain, the starting villains in this game are: ' + villainsList, villain.user.id));
		var game = new Game(numVillains, maxVillains, players);
		saveGame(interaction, game);
		//await interaction.deleteReply();
		//console.log(interaction.client.text);
		let response = "A new game has been started with " + playerCount.toString() + " players!";
		await interaction.reply({ content: response });
	},
};

function getRandomInt(min, max) {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}