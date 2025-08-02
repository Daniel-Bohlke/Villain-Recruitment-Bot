const { Client, SlashCommandBuilder, MessageFlags, ActionRowBuilder, UserSelectMenuBuilder, ComponentType } = require('discord.js');
const { Player, Game, saveGame, directMessageUser } = require('../../helpers.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-game')
		.setDescription('Initiates a game of Heroes and Villains.'),
	async execute(interaction) {
		const userSelect = new UserSelectMenuBuilder()
			.setCustomId('users')
			.setPlaceholder('Select multiple players. (Minimum 8)')
			.setMinValues(8)
			.setMaxValues(25);

		const row1 = new ActionRowBuilder()
			.addComponents(userSelect);

		const response = await interaction.reply({
			content: 'Select players:',
			components: [row1],
			withResponse: true,
		});
		
		const collector = response.resource.message.createMessageComponentCollector({ componentType: ComponentType.UserSelect, time: 3_600_000 });
		collector.on('collect', async i => {
			var userIds = [];
			userIds = i.values;
			var users = [];
			const userNames = await Promise.all(
				userIds.map(async (userId) => {
				  const user = await interaction.guild.members.fetch(userId);
				  return user.user.username; // Fetch username
				})
			  );
			for(let j = 0; j < userIds.length; j++){
				users.push({id: userIds[j], username: userNames[j]});
			}
			console.log(users);
			console.log(users.length);
			//Initialize an array of Players
			var players = []; 
			var playerCount = 0;
			var villains = [];
			var villainsList = '';
			var heroes = [];
			for(let j = 0; j < users.length; j++){
				let playerNumber = j + 1;
				var user = {id: users[j], username: users[j].username};
				if(user != null){
					playerCount++;
					players.push(new Player(user, j));
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
			for(let j = 0; j < heroes.length; j++){
				await interaction.client.users.send(heroes[j].id, "You are a Hero! Good luck in defeating evil.");
			}
			for(let j = 0; j < villains.length; j++){
				await interaction.client.users.send(villains[j].id, 'You are a villain, the starting villains in this game are: ' + villainsList, villain.user.id);
			}
			var game = new Game(numVillains, maxVillains, players);
			saveGame(interaction, game);
			//await interaction.deleteReply();
			//console.log(interaction.client.text);
			let response = "A new game has been started with " + playerCount.toString() + " players!";
			await interaction.editReply({ content: response });
		})
	},
};

function getRandomInt(min, max) {
  min = Math.ceil(min); // Ensure min is an integer
  max = Math.floor(max); // Ensure max is an integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}