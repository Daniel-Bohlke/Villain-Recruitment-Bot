

export class Player {
	user;
	isVillain;
	beingRecruited;
	isDead;
	
	function Player(user){
		this.user = user;
		this.isVillain = false;
		this.beingRecruited = false;
		this.isDead = false;
	}
}