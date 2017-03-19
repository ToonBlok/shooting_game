const CANVAS = document.getElementById('screen');
const CONTEXT = CANVAS.getContext('2d');
CONTEXT.font = "30px Arial";
CONTEXT.fillStyle = "white";

var PLAYER = new Player((CANVAS.width / 2), CANVAS.height);
var gTile_water = new Image();
gTile_water.src = "resources/tile_water.png";
var gTile_water_flipped = new Image();
gTile_water_flipped.src = "resources/tile_water_flipped.png";
var gReload_icon = new Image();
gReload_icon.src = "resources/ammo_icon.png";
let ALTERNATE_MISSILE_WING = 0;

var MISSILES = [];
var ENEMY_JETS = [];
var EXPLOSIONS = [];

var TIMER_RELOAD = 0;
var TIMER_STARTING_TIME = 0;
var RELOADING = 0;
var RELOAD_DURATION = 2000;
var enemySpawnInterval = 2000;
var missileDrawDelay = 500;
var TEMP_TOTAL_FRAMERATE = 0;
var FPS = 60;

// ## Classes ##
// these are constructor functions and classes (not object literals) 
// JS's version of a class
function Player(initialX, initialY) { 
	this.image = new Image(); 
	this.image.src = "resources/sprite_jet_player.png";
	this.image.width = 60;
	this.image.height = 60;
	this.x = initialX;
	this.y = initialY - this.image.height;
	this.speed = 5;
	//this.score = 0;
	this.alive = 1;
	this.maxRockets = 6;
	this.ammoRockets = this.maxRockets;

	this.draw = function() {
		CONTEXT.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
	}
	this.getInfo = function() {
		return "x = " + this.x + ", y = " + this.y;
	}
	this.fireMissile = function() {
		if (PLAYER.ammoRockets > 0) {
			let middleOfJet = PLAYER.x + (PLAYER.image.width / 2);
			var missile = new Missile(PLAYER.y + 47);
			if (ALTERNATE_MISSILE_WING == 0) { // left
				missile.x = middleOfJet - 25;
				ALTERNATE_MISSILE_WING = 1;
			} else if (ALTERNATE_MISSILE_WING == 1) { // right
				missile.x = ((middleOfJet + 25) - missile.image.width);
				ALTERNATE_MISSILE_WING = 0;
			}

			MISSILES.push(missile);
			PLAYER.ammoRockets -= 1;
		}
	}
	this.reload = function() {
		if (!Boolean(RELOADING)) {
			TIMER_STARTING_TIME = gTimer;
			RELOADING = 1;
		}
		if (gTimer > (TIMER_STARTING_TIME + RELOAD_DURATION)) {
			PLAYER.ammoRockets = PLAYER.maxRockets;
			TIMER_STARTING_TIME = 0;
			RELOADING = 0;
		}
	}
}

function Missile(initialY) {
	this.image = new Image(); 
	this.image.src = "resources/sprite_missile2.png";
	//this.image.src = "resources/spritesheet_missile4.png";
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
	this.image.src = "resources/sprite_jet_enemy.png";
	this.image.width = 60;
	this.image.height = 60;
	this.x = initialX;
	this.y = initialY - this.image.height;
	this.speed = 3;
	this.enemyWaypoints = [[CANVAS.width / 2, CANVAS.height / 2], [42, 42]];
}

function Explosion(initialX, initialY) {
	this.image = new Image(); 
	//this.image.src = "resources/sprite_explosion.png";
	this.image.src = "resources/spritesheet_explosions.png";
	this.width = 64;
	this.height = 64;
	this.x = initialX;
	this.y = initialY; 
	this.startTime = 0;

	this.maxFrames = 25;
	this.tickCount = -1;
	this.rocketTimer = 0;
}

EnemyJet.prototype.getWayPoints = function() {

}

Missile.prototype.draw = function() {
	CONTEXT.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
	//alert(this.x + ", " + this.y);
	//CONTEXT.drawImage(this.image, this.tickCount * 204, 0, this.image.width, this.image.height, this.x, this.y, 50, 50);
};

Missile.prototype.update = function() {
	if (this.tickCount != 2) {
		this.tickCount += 1;
	} else if (this.tickCount == 2) {
		this.tickCount -= 1;
	}
};

EnemyJet.prototype.draw = function() {
	CONTEXT.drawImage(this.image, this.x, this.y, this.image.width, this.image.height);
};

Explosion.prototype.draw = function() {
	CONTEXT.drawImage(this.image, this.tickCount * 64, 0, this.width, this.height, this.x, this.y, this.width, this.height);
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
	if (Boolean(PLAYER.alive)) {
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
				PLAYER.fireMissile();
			break;
			case 73:
				alert("Player.x = " + PLAYER.x + ", Player.Y = " + PLAYER.y);
			break;
		}
	}
}
window.onkeyup = function(e) {
	if (Boolean(PLAYER.alive)) {
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
	let maxHorizontalTiles = CANVAS.width / tileSize;
	let maxVerticalTiles = CANVAS.height / tileSize;
	let maxTiles = maxVerticalTiles * maxHorizontalTiles;

	for (let i = 0; i < maxVerticalTiles; i++) {
		for (let a = 0; a < maxHorizontalTiles; a++) {
			CONTEXT.drawImage(gTile_water_flipped, (a * tileSize), (i * tileSize), tileSize, tileSize);
		}
	}
}

var gTimer_enemies = 0;
var gSpawn_interval = 5000;
function updateEnemies (frameDuration) {
	for (let i = 0; i < ENEMY_JETS.length; i++) {
		if (ENEMY_JETS[i].y > CANVAS.height) {
			ENEMY_JETS.splice(i, 1);
		}
	}

	for (let i = 0; i < ENEMY_JETS.length; i++) {
		if(ENEMY_JETS[i].x > ENEMY_JETS[i].enemyWaypoints[0][0]) {
			if (ENEMY_JETS[i].x - ENEMY_JETS[i].speed < ENEMY_JETS[i].enemyWaypoints[0][0]) {
				ENEMY_JETS[i].x = ENEMY_JETS[i].enemyWaypoints[0][0];
			} else {
				ENEMY_JETS[i].x -= ENEMY_JETS[i].speed;
			}
		} else if(ENEMY_JETS[i].x < ENEMY_JETS[i].enemyWaypoints[0][0]) {
			if (ENEMY_JETS[i].x + ENEMY_JETS[i].speed > ENEMY_JETS[i].enemyWaypoints[0][0]) {
				ENEMY_JETS[i].x = ENEMY_JETS[i].enemyWaypoints[0][0];
			} else {
				ENEMY_JETS[i].x += ENEMY_JETS[i].speed;
			}
		}
		if(ENEMY_JETS[i].y != ENEMY_JETS[i].enemyWaypoints[0][1]) {
			ENEMY_JETS[i].y += ENEMY_JETS[i].speed;
		}
	}

	for (let i = 0; i < ENEMY_JETS.length; i++) {
		if(ENEMY_JETS[i].x == ENEMY_JETS[i].enemyWaypoints[0][0] &&
		   ENEMY_JETS[i].y == ENEMY_JETS[i].enemyWaypoints[0][1]) {
			ENEMY_JETS[i].enemyWaypoints.splice(0, 1);
		}
	}


	if (gTimer > 1000 && ENEMY_JETS < 1) {
	  	var enemy_jet = new EnemyJet((CANVAS.width / 2), CANVAS.height);
	  	var randomSpawnX = Math.floor(Math.random() * (CANVAS.width / 100));
	  	enemy_jet.x = randomSpawnX * 100;
	  	enemy_jet.y = -100;
	  	ENEMY_JETS.push(enemy_jet);

	}
//	console.log(frameDuration);
//	if (gTimer_enemies == 0) {
//		gTimer_enemies = frameDuration;
//	} else {
//		gTimer_enemies = gTimer_enemies + frameDuration;
//	}	
//
//	if (gTimer_enemies > gSpawn_interval) {
//		var enemy_jet = new EnemyJet((CANVAS.width / 2), CANVAS.height);
//		var randomSpawnX = Math.floor(Math.random() * (CANVAS.width / 100));
//		enemy_jet.x = randomSpawnX * 100;
//		enemy_jet.y = -100;
//		ENEMY_JETS.push(enemy_jet);
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
	let menuPosX = ((CANVAS.width / 2) - (menuSizeX / 2));
	let menuPosY = ((CANVAS.height / 2) - (menuSizeY / 2));
	CONTEXT.strokeStyle = "white";
	CONTEXT.strokeRect(menuPosX, menuPosY, menuSizeX, menuSizeY);
	CONTEXT.stroke();

	CONTEXT.font = "123px Arial";
	CONTEXT.fillText("You died", menuPosX + 10, menuPosY + (menuSizeY / 2) + 35);
	CONTEXT.font = "30px Arial";
}

function move() {

	switch (Boolean(Keys)) {
		case Keys.UP && Keys.LEFT: // Northeast 
			if ((isInsideBounds(PLAYER.x, (PLAYER.y - PLAYER.speed))) && (isInsideBounds((PLAYER.x - PLAYER.speed), PLAYER.y))) {
				PLAYER.y -= PLAYER.speed;
				PLAYER.x -= PLAYER.speed;
			}
		break;
		case Keys.UP && Keys.RIGHT: // Northwest
			if ((isInsideBounds(PLAYER.x, (PLAYER.y - PLAYER.speed))) && (isInsideBounds((PLAYER.x + PLAYER.speed), PLAYER.y))) {
				PLAYER.y -= PLAYER.speed;
				PLAYER.x += PLAYER.speed;
			}
		break;
		case Keys.DOWN && Keys.LEFT: // Southeast 
			if ((isInsideBounds(PLAYER.x, (PLAYER.y + PLAYER.speed))) && (isInsideBounds((PLAYER.x - PLAYER.speed), PLAYER.y))) { 
				PLAYER.y += PLAYER.speed;
				PLAYER.x -= PLAYER.speed;
			}
		break;
		case Keys.DOWN && Keys.RIGHT: // Southwest 
			if ((isInsideBounds(PLAYER.x, (PLAYER.y + PLAYER.speed))) && (isInsideBounds((PLAYER.x + PLAYER.speed), PLAYER.y))) { 
				PLAYER.y += PLAYER.speed;
				PLAYER.x += PLAYER.speed;
			}
		break;
		case Keys.UP: // North 
			if (isInsideBounds(PLAYER.x, (PLAYER.y - PLAYER.speed)))
				PLAYER.y -= PLAYER.speed;
		break;
		case Keys.LEFT: // East 
			if (isInsideBounds((PLAYER.x - PLAYER.speed), PLAYER.y))
				PLAYER.x -= PLAYER.speed;
		break;
		case Keys.RIGHT: // West 
			if (isInsideBounds((PLAYER.x + PLAYER.speed), PLAYER.y))
				PLAYER.x += PLAYER.speed;
		break;
		case Keys.DOWN: // South 
			if (isInsideBounds(PLAYER.x, (PLAYER.y + PLAYER.speed)))
				PLAYER.y += PLAYER.speed;
		break;
	}

	for (let i = 0; i < MISSILES.length; i++) {
		MISSILES[i].y -= MISSILES[i].speed;
	}
}

function isInsideBounds(x, y) {
	if (y > (CANVAS.height - PLAYER.image.height)) { // prevent down
		return 0;
	} else if (x < 0) {
		return 0;
	} else if (x > (CANVAS.width - PLAYER.image.width)) {
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
   Player is a prototype, the PLAYER var below inherits from the prototypeaPlayer has a prototype object from which it inherits stuffPlayer has a prototype object from which it inherits stuff
*/
