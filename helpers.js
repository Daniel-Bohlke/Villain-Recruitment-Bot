const { Client, SlashCommandBuilder, MessageFlags } = require('discord.js');


export function getGame(interaction){
	try{
		var game = JSON.parse(interaction.client.text);
		return game;
	}
	catch(e){
		var response = 'Error - a game has not been started or another error has occured.';
		await interaction.reply({ content: response, flags: MessageFlags.Ephemeral });
		return null;
	}
}

export function saveGame(interaction, client){
	interaction.client.text = game.toJSON();
	return;
}

export function endGame(interaction){
	interaction.Client.text = '';
}

export function directMessageUser(interaction, message, userID){
	await interaction.client.users.send(userID, message);
}

export function findPlayer(players, id){
	var player = null;
	for(let i = 0; i < players.count; i++){
		if(players[i].user.id === id){
			player = players[i];
		}
	}
	return player;
}

export class Player {
	index;
	user;
	isVillain;
	beingRecruited;
	isDead;
	shadowArmor;
	canGrantShadowArmor;
	
	function Player(user, index){
		this.index = index;
		this.user = user;
		this.isVillain = false;
		this.beingRecruited = false;
		this.isDead = false;
		this.shadowArmor = false;
		this.canGrantShadowArmor = false;
	}
}

export class Game {
	numVillains;
	maxVillains;
	players;
	villainActionReady;
	pendingResponse;
	recruitingPlayer;
	livingPlayers;
	grantingShadowArmor;
	
	function Game(numVillains, maxVillains, players){
		this.numVillains = numVillains;
		this.maxVillains = maxVillains;
		this.players = players;
		this.livingPlayers = players.Count;
		this.villainActionReady = true;
		this.pendingResponse = false;
		this.recruitingPlayer = null;
		this.grantingShadowArmor = false;
	}
}