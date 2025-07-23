const { Player } = require('./Player.js');

export class Game {
	numVillains;
	maxVillains;
	players;
	villainActionReady;
	pendingResponse;
	
	function Player(numVillains, maxVillains, players){
		this.numVillains = numVillains;
		this.maxVillains = maxVillains;
		this.players = players;
		this.villainActionReady = true;
		this.pendingResponse = false;
	}
}