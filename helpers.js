const { Client, SlashCommandBuilder, MessageFlags } = import('discord.js');


export function getGame(interaction){
	try{
		var game = JSON.parse(interaction.client.text);
		console.log(game);
		return game;
	}
	catch(e){
		return null;
	}
}

export function saveGame(interaction, game){
	interaction.client.text = JSON.stringify(game);
	return;
}

export function endGame(interaction){
	interaction.client.text = '';
}

export function findPlayer(players, id){
	var player = null;
	for(let i = 0; i < players.length; i++){
		if(players[i].user.id === id){
			console.log("Found Player: " + players[i].user.username);
			player = players[i];
		}
	}
	return player;
}

export async function directMessageUser(interaction, userId, payload) {
  try {
    const user = await interaction.client.users.fetch(userId);
    if (!user) return false;
    await user.send(payload);
    return true;
  } catch (err) {
    console.error(`Failed to DM user ${userId}:`, err);
    return false;
  }
}

export class Player {
	index;
	user;
	isVillain;
	beingRecruited;
	isDead;
	shadowArmor;
	canGrantShadowArmor;
	
	constructor(user, index){
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
	
	constructor(numVillains, maxVillains, players){
		this.numVillains = numVillains;
		this.maxVillains = maxVillains;
		this.players = players;
		this.livingPlayers = players.Count;
		this.villainActionReady = false;
		this.pendingResponse = false;
		this.recruitingPlayer = null;
		this.grantingShadowArmor = false;
	}
}