const gCanvas = document.getElementById('screen');
const gContext = gCanvas.getContext('2d');
gContext.font = "30px Arial";
gContext.fillStyle = "white";

// Game namespace
var game = {
	player: new Player((gCanvas.width / 2), gCanvas.height),
	// test

	tile_water: new Image(),
	reload_icon: new Image(),

	test: function() {
		this.tile_water.src = "img/tile_water.png";
		this.reload_icon.src = "img/ammo_icon.png";
	},

	sword: function() {
		this.slash = function(){
			alert("attacked");
		}
	}

	
};

game.test();
var abc = new game.sword();


var MISSILES = [];
var gEnemy_jets = [];
var gExplosions = [];
var gBoats = [];

var TIMER_RELOAD = 0;
var TIMER_STARTING_TIME = 0;
var RELOADING = 0;
var RELOAD_DURATION = 2000;
var enemySpawnInterval = 2000;
var missileDrawDelay = 500;
var TEMP_TOTAL_FRAMERATE = 0;

// ## Classes ##
// these are constructor functions and classes (not object literals) 
// JS's version of a class
function Player(initialX, initialY) { 
	this.image = new Image(); 
	this.image.src = "img/sprite_jet_player.png";
	this.image.width = 60;
	this.image.height = 60;
	this.x = initialX;
	this.y = initialY - this.image.height;
	this.speed = 5;
	this.alive = 1;
	this.maxRockets = 6;
	this.ammoRockets = this.maxRockets;
	this.rocketPodReady = 0;

	this.draw = function() {
		gContext.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
	}
	this.fireMissile = function() {
		if (game.player.ammoRockets > 0) {
			let middleOfJet = game.player.x + (game.player.image.width / 2);
			var missile = new Missile(game.player.y + 47);
			if (game.player.rocketPodReady == 0) { // left
				missile.x = middleOfJet - 25;
				game.player.rocketPodReady = 1;
			} else if (game.player.rocketPodReady == 1) { // right
				missile.x = ((middleOfJet + 25) - missile.image.width);
				game.player.rocketPodReady = 0;
			}

			MISSILES.push(missile);
			game.player.ammoRockets -= 1;
		}
	}
	this.reload = function() {
		if (!Boolean(RELOADING)) {
			TIMER_STARTING_TIME = gTimer;
			RELOADING = 1;
		}
		if (gTimer > (TIMER_STARTING_TIME + RELOAD_DURATION)) {
			game.player.ammoRockets = game.player.maxRockets;
			TIMER_STARTING_TIME = 0;
			RELOADING = 0;
		}
	}
}

function Missile(initialY) {
	this.image = new Image(); 
	this.image.src = "img/sprite_missile2.png";
	//this.image.src = "img/spritesheet_missile4.png";
	//this.image.width = 204;
	//this.image.height = 213;
	this.image.width = 7;
	this.image.height = 35;
	this.x = 0;
	this.y = initialY - this.image.height;
	this.speed = 7;

	this.maxFrames = 3;
	this.tickCount = 0;
}

function EnemyJet(initialX, initialY) {
	this.image = new Image(); 
	this.image.src = "img/sprite_jet_enemy.png";
	this.image.width = 60;
	this.image.height = 60;
	this.x = initialX;
	this.y = initialY - this.image.height;
	this.speed = 3;
	//this.enemyWaypoints = [[gCanvas.width / 2, gCanvas.height / 2], [42, 42]];
	this.waypoints = [];
}

function NeutralBoat(initialX, initialY) {
	this.image = new Image(); 
	this.image.src = "img/neutral_ship.png";
	this.image.width = 40;
	this.image.height = 130;
	this.x = initialX;
	this.y = initialY;
	this.speed = 0.5;
	//this.enemyWaypoints = [[gCanvas.width / 2, gCanvas.height / 2], [42, 42]];
	this.waypoints = [];
}

function Explosion(initialX, initialY) {
	this.image = new Image(); 
	//this.image.src = "img/sprite_explosion.png";
	this.image.src = "img/spritesheet_explosions.png";
	this.width = 64;
	this.height = 64;
	this.x = initialX;
	this.y = initialY; 
	this.startTime = 0;

	this.maxFrames = 25;
	this.tickCount = -1;
	this.rocketTimer = 0;
}

NeutralBoat.prototype.draw = function() {
	gContext.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
};

//EnemyJet.prototype.getWayPoints = function() {
//
//};

Missile.prototype.draw = function() {
	gContext.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
	//alert(this.x + ", " + this.y);
	//gContext.drawImage(this.image, this.tickCount * 204, 0, this.image.width, this.image.height, this.x, this.y, 50, 50);
};

Missile.prototype.update = function() {
	if (this.tickCount != 2) {
		this.tickCount += 1;
	} else if (this.tickCount == 2) {
		this.tickCount -= 1;
	}
};

EnemyJet.prototype.draw = function() {
	gContext.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
};

Explosion.prototype.draw = function() {
	gContext.drawImage(this.image, this.tickCount * 64, 0, this.width, this.height, this.x, this.y, this.width, this.height);
};

Explosion.prototype.update = function() {
	this.tickCount += 1;
	if (this.tickCount == this.maxFrames) {
		tickCount = 0;
	}

};




// ## Events ##
var Keys = {
	UP: false,
	LEFT: false,
	RIGHT: false,
	DOWN: false
};

window.onkeydown = function(e) {
	if (Boolean(game.player.alive)) {
		switch (e.keyCode) {
			case 87: 
				Keys.UP = true;
			break;
			case 65:
				Keys.LEFT = true;
			break;
			case 68:
				Keys.RIGHT = true;
			break;
			case 83:
				Keys.DOWN = true;
			break;
			case 32:
				game.player.fireMissile();
			break;
			case 73:
				alert("Player.x = " + game.player.x + ", Player.Y = " + game.player.y);
			break;
		}
	}
}
window.onkeyup = function(e) {
	if (Boolean(game.player.alive)) {
		switch (e.keyCode) {
			case 87: 
				Keys.UP = false;
			break;
			case 65:
				Keys.LEFT = false;
			break;
			case 68:
				Keys.RIGHT = false;
			break;
			case 83:
				Keys.DOWN = false;
			break;
		}
	}
}

window.onload = init; 

function init() {
	window.requestAnimationFrame(frame);
	drawTileArray();
}

function drawTileArray() {
	let tileSize = 50; // size 15 costs 30 frames, 50 cost no performance it seems
	let maxHorizontalTiles = gCanvas.width / tileSize;
	let maxVerticalTiles = gCanvas.height / tileSize;
	let maxTiles = maxVerticalTiles * maxHorizontalTiles;

	for (let i = 0; i < maxVerticalTiles; i++) {
		for (let a = 0; a < maxHorizontalTiles; a++) {
			gContext.drawImage(game.tile_water, (a * tileSize), (i * tileSize), tileSize, tileSize);
		}
	}
}

function outOfBounds(x, y) {
	if (y > gCanvas.height ||
		y < 0 ||
		x < 0 ||
		x > gCanvas.width) {
		return true;
	} else {
		return false;
	}
}

var gTimer_enemies = 0;
var gSpawn_interval = 5000;
function updateEnemies (frameDuration) {
	for (let i = 0; i < gEnemy_jets.length; i++) {
		if (gEnemy_jets[i].waypoints == 0) {
			gEnemy_jets[i].waypoints.push([Math.floor(Math.random() * gCanvas.width), Math.floor(Math.random() * gCanvas.height / 2)]);

		}
		if (Boolean(outOfBounds(gEnemy_jets[i].x, gEnemy_jets[i].y))) {
			gEnemy_jets.splice(i, 1);
		}
	}

	for (let i = 0; i < gEnemy_jets.length; i++) {
		//document.getElementById("debug").innerHTML = gEnemy_jets[0].waypoints[0][0] + ", " + gEnemy_jets[0].waypoints[0][1];
		let waypointX = gEnemy_jets[i].waypoints[0][0];
		let waypointY = gEnemy_jets[i].waypoints[0][1];
		if(gEnemy_jets[i].x > waypointX) {
			if (gEnemy_jets[i].x - gEnemy_jets[i].speed < waypointX) {
				gEnemy_jets[i].x = waypointX;
			} else {
				gEnemy_jets[i].x -= gEnemy_jets[i].speed;
			}
		} else if(gEnemy_jets[i].x < waypointX) {
			if (gEnemy_jets[i].x + gEnemy_jets[i].speed > waypointX) {
				gEnemy_jets[i].x = waypointX; 
			} else {
				gEnemy_jets[i].x += gEnemy_jets[i].speed;
			}
		}
		if(gEnemy_jets[i].y < waypointY) {
			if (gEnemy_jets[i].y + gEnemy_jets[i].speed > waypointY) { // DOWN 
				gEnemy_jets[i].y = waypointY;
				//alert("ok");
			} else {
				gEnemy_jets[i].y += gEnemy_jets[i].speed;
			}
		} else if(gEnemy_jets[i].y > waypointY) {                      // UP 
			if (gEnemy_jets[i].y - gEnemy_jets[i].speed < waypointY) {
				gEnemy_jets[i].y = waypointY;
			} else {
				gEnemy_jets[i].y -= gEnemy_jets[i].speed;
			}
		}
	}
	for (let i = 0; i < gBoats.length; i++) {
		gBoats[i].y -= gBoats[i].speed;
	}
	for (let i = 0; i < gBoats.length; i++) {
		if (gBoats[i].y < 0 - gBoats[i].image.height) {
			gBoats.splice(i, 1);
		}
	}
	/*
	 * if 0 < y400
	 * if 0 + 10 < 
	 
	 */
	document.getElementById("debug").innerHTML = gBoats.length;



	for (let i = 0; i < gEnemy_jets.length; i++) {
		if(gEnemy_jets[i].x == gEnemy_jets[i].waypoints[0][0] &&
		   gEnemy_jets[i].y == gEnemy_jets[i].waypoints[0][1]) {
			gEnemy_jets[i].waypoints.splice(0, 1);
		}
	}


	if (gTimer > 1000 && gEnemy_jets < 1) {
	  	var enemy_jet = new EnemyJet((gCanvas.width / 2), gCanvas.height);
	  	var randomSpawnX = Math.floor(Math.random() * (gCanvas.width / 100));
	  	enemy_jet.x = randomSpawnX * 100;
	  	enemy_jet.y = 10;
	  	gEnemy_jets.push(enemy_jet);
	}
	//alert(gBoats.length);
	//console.log(gBoats.length);
	if (gBoats < 1) {
	  	var boat = new NeutralBoat((gCanvas.width / 2), gCanvas.height);
	  	var randomSpawnX = Math.floor(Math.random() * (gCanvas.width / 100));
	  	boat.x = randomSpawnX * 100;
	  	boat.y = gCanvas.height;
	  	gBoats.push(boat);
	}
//	console.log(frameDuration);
//	if (gTimer_enemies == 0) {
//		gTimer_enemies = frameDuration;
//	} else {
//		gTimer_enemies = gTimer_enemies + frameDuration;
//	}	
//
//	if (gTimer_enemies > gSpawn_interval) {
//		var enemy_jet = new EnemyJet((gCanvas.width / 2), gCanvas.height);
//		var randomSpawnX = Math.floor(Math.random() * (gCanvas.width / 100));
//		enemy_jet.x = randomSpawnX * 100;
//		enemy_jet.y = -100;
//		gEnemy_jets.push(enemy_jet);
//
//		gTimer_enemies = 0;
//	}
}


// Returns ms since program started

function collision (entityOneX, entityOneY, entityTwoX, entityTwoY, entityOneWidth, entityOneHeight, entityTwoWidth, entityTwoHeight) {
	if (entityOneX < entityTwoX + entityTwoWidth &&
	   entityOneX + entityOneWidth > entityTwoX &&
	   entityOneY < entityTwoY + entityTwoHeight &&
	   entityOneHeight + entityOneY > entityTwoY) {
		return true;
	} else {
		return false;
	}
}




function drawMenu() {
	let menuSizeX = 500;
	let menuSizeY = 300;
	let menuPosX = ((gCanvas.width / 2) - (menuSizeX / 2));
	let menuPosY = ((gCanvas.height / 2) - (menuSizeY / 2));
	gContext.strokeStyle = "white";
	gContext.strokeRect(menuPosX, menuPosY, menuSizeX, menuSizeY);
	gContext.stroke();

	gContext.font = "123px Arial";
	gContext.fillText("You died", menuPosX + 10, menuPosY + (menuSizeY / 2) + 35);
	gContext.font = "30px Arial";
}

function move() {

	switch (Boolean(Keys)) {
		case Keys.UP && Keys.LEFT: // Northeast 
			if ((isInsideBounds(game.player.x, (game.player.y - game.player.speed))) && (isInsideBounds((game.player.x - game.player.speed), game.player.y))) {
				game.player.y -= game.player.speed;
				game.player.x -= game.player.speed;
			}
		break;
		case Keys.UP && Keys.RIGHT: // Northwest
			if ((isInsideBounds(game.player.x, (game.player.y - game.player.speed))) && (isInsideBounds((game.player.x + game.player.speed), game.player.y))) {
				game.player.y -= game.player.speed;
				game.player.x += game.player.speed;
			}
		break;
		case Keys.DOWN && Keys.LEFT: // Southeast 
			if ((isInsideBounds(game.player.x, (game.player.y + game.player.speed))) && (isInsideBounds((game.player.x - game.player.speed), game.player.y))) { 
				game.player.y += game.player.speed;
				game.player.x -= game.player.speed;
			}
		break;
		case Keys.DOWN && Keys.RIGHT: // Southwest 
			if ((isInsideBounds(game.player.x, (game.player.y + game.player.speed))) && (isInsideBounds((game.player.x + game.player.speed), game.player.y))) { 
				game.player.y += game.player.speed;
				game.player.x += game.player.speed;
			}
		break;
		case Keys.UP: // North 
			if (isInsideBounds(game.player.x, (game.player.y - game.player.speed)))
				game.player.y -= game.player.speed;
		break;
		case Keys.LEFT: // East 
			if (isInsideBounds((game.player.x - game.player.speed), game.player.y))
				game.player.x -= game.player.speed;
		break;
		case Keys.RIGHT: // West 
			if (isInsideBounds((game.player.x + game.player.speed), game.player.y))
				game.player.x += game.player.speed;
		break;
		case Keys.DOWN: // South 
			if (isInsideBounds(game.player.x, (game.player.y + game.player.speed)))
				game.player.y += game.player.speed;
		break;
	}

	for (let i = 0; i < MISSILES.length; i++) {
		MISSILES[i].y -= MISSILES[i].speed;
	}
}

function isInsideBounds(x, y) {
	if (y > (gCanvas.height - game.player.image.height)) { // prevent down
		return 0;
	} else if (x < 0) {
		return 0;
	} else if (x > (gCanvas.width - game.player.image.width)) {
		return 0;
	} else if (y < 0) {
		return 0;
	} else {
		return 1;
	}
}

/*
   Player has a prototype object from which it inherits stuff
   When instantiating from this class, a link is created to the original Player constructor class
   Player is a prototype, the player var below inherits from the prototypeaPlayer has a prototype object from which it inherits stuffPlayer has a prototype object from which it inherits stuff
*/
