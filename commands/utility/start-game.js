const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');
const { Player, Game, saveGame, directMessageUser } = require('../../helpers.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start')
		.setDescription('Initiates a game of Heroes and Villains.')
		.addUserOption(option =>
		option.setName('player1')
			.setDescription('Player 1')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player2')
			.setDescription('Player 2')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player3')
			.setDescription('Player 3')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player4')
			.setDescription('Player 4')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player5')
			.setDescription('Player 5')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player6')
			.setDescription('Player 6')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player7')
			.setDescription('Player 7')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player8')
			.setDescription('Player 8')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player9')
			.setDescription('Player 9')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player10')
			.setDescription('Player 10')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player11')
			.setDescription('Player 11')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player12')
			.setDescription('Player 12')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player13')
			.setDescription('Player 13')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player14')
			.setDescription('Player 14')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player15')
			.setDescription('Player 15')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player16')
			.setDescription('Player 16')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player17')
			.setDescription('Player 17')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player18')
			.setDescription('Player 18')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player19')
			.setDescription('Player 19')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player20')
			.setDescription('Player 20')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player21')
			.setDescription('Player 21')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player22')
			.setDescription('Player 22')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player23')
			.setDescription('Player 23')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player24')
			.setDescription('Player 24')
			.setRequired(true))
			.addUserOption(option =>
		option.setName('player25')
			.setDescription('Player 25')
			.setRequired(true)),
	async execute(interaction) {
		//Initialize an array of Players
		var playerCount = 0;
		var players = []; 
		var villains = [];
		var villainsList = '';
		var heroes = [];
		for(let i = 0; i < 25; i++){
			let playerNumber = i + 1;
			let playerSearch = "player" + playerNumber.toString();
			var user = interaction.options.getUser(playerSearch);
			if(user != null){
				playerCount++;
				players.push(new Player(user, i));
				console.log("Player Added");
			}
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
		players.forEach((player) => { if(!player.isVillain){heroes.push(player);}});
		for(let i = 0; i < heroes.count; i++){
			await interaction.client.users.send(heroes[i].user.id, "You are a Hero! Good luck in defeating evil.");
		}
		for(let i = 0; i < villains.count; i++){
			await interaction.client.users.send(villains[i].user.id, 'You are a villain, the starting villains in this game are: ' + villainsList, villain.user.id);
		}
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