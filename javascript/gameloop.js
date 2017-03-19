var gTimer = 0;
var gNow, gLast = timestamp();
var gFps_count = 0;
var gTotal_frames = 0;
var step = 1000 / 60;
var gFrameDuration = 0

function frame() {
	gNow = timestamp();
	gFrameDuration = gFrameDuration + Math.min(1000, gNow - gLast);
	gLast = gNow;
	gTimer = window.performance.now();

	//alert("gFrameDuration: " + gFrameDuration + " > " + step);
	while (gFrameDuration > step) {
		update(gFrameDuration);
		gFrameDuration = gFrameDuration - step;
	}

	render();

	window.requestAnimationFrame(frame);
}


function update(gFrameDuration) {
	calculateFps();
	move();

	for (let i = 0; i < gExplosions.length; i++) {
		gExplosions[i].update();
	}

	for (let i = 0; i < MISSILES.length; i++) {
		for (let a = 0; a < gEnemy_jets.length; a++) {

			if (collision(MISSILES[i].x, MISSILES[i].y, gEnemy_jets[a].x, gEnemy_jets[a].y, MISSILES[i].image.width, MISSILES[i].image.height, (gEnemy_jets[a].image.width + 5), gEnemy_jets[a].image.height)) {

				var explosion = new Explosion(gEnemy_jets[a].x, gEnemy_jets[a].y);
				explosion.startTime = gTimer;
				gExplosions.push(explosion);

				MISSILES.splice(i, 1);
				gEnemy_jets.splice(a, 1);
				break; 
			}

		}
	}

	for (let i = 0; i < MISSILES.length; i++) {
		if (MISSILES[i].y < 0) {
			MISSILES.splice(i, 1);
		}
	}


	if (Boolean(PLAYER.alive)) {
		for (let i = 0; i < gEnemy_jets.length; i++) {
			if (collision(PLAYER.x, PLAYER.y, gEnemy_jets[i].x, gEnemy_jets[i].y, PLAYER.image.width, PLAYER.image.height, gEnemy_jets[i].image.width, gEnemy_jets[i].image.height)) {
				var explosion = new Explosion(gEnemy_jets[i].x, gEnemy_jets[i].y);
				explosion.startTime = gTimer;
				gExplosions.push(explosion);

				var secondExplosion = new Explosion(PLAYER.x, PLAYER.y);
				secondExplosion.startTime = gTimer;
				gExplosions.push(secondExplosion);
				gEnemy_jets.splice(i, 1);
				PLAYER.alive = 0;
			}
		}
	}

	if (PLAYER.ammoRockets == 0) {
		PLAYER.reload();
	}

	for (let i = 0; i < gExplosions.length; i++) {
		if ((gTimer - 1000) > gExplosions[i].startTime) {
			gExplosions.splice(i, 1);
		}
	}

	updateEnemies(gFrameDuration);
}


function render() {
	drawTileArray();
	if (gTotal_frames > 45)
		console.log(gTotal_frames);

	//CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);
	for (let i = 0; i < gBoats.length; i++) {
		gBoats[i].draw();
	}
	for (let i = 0; i < MISSILES.length; i++) {
		MISSILES[i].draw();
	}
	for (let i = 0; i < gEnemy_jets.length; i++) {
		gEnemy_jets[i].draw();
	}
	for (let i = 0; i < gExplosions.length; i++) {
		gExplosions[i].draw();
	}
	CONTEXT.fillText("FPS: " + TEMP_TOTAL_FRAMERATE, 2,25);
	if (Boolean(PLAYER.alive)) {
		PLAYER.draw();
		//console.log("Player DRAWN");
	}


	if (PLAYER.ammoRockets != 0) {
		for (let i = 0; i < PLAYER.ammoRockets; i++) {
			CONTEXT.drawImage(gReload_icon, i * gReload_icon.width / 3, CANVAS.height - gReload_icon.height / 3, gReload_icon.width / 3, gReload_icon.height / 3);
		}
		//CONTEXT.fillText(PLAYER.ammoRockets, gReload_icon.width / 3, CANVAS.height - 4);
	} 

	COUNT = 0;

	if (!Boolean(PLAYER.alive)) {
		drawMenu();
	}


	gTotal_frames += 1;
	CONTEXT.fillText(Math.floor(gTimer / 1000), CANVAS.width - 38, 25);
}

var gTimer_fps = 0;
function calculateFps () {
	if (gTimer_fps == 0) {
		gTimer_fps = gFrameDuration;
	} else {
		gTimer_fps = gTimer_fps + gFrameDuration;
	}

	if(gTimer_fps > 1000) {
		CONTEXT.fillText("FPS: " + gTotal_frames, 2,25);
		TEMP_TOTAL_FRAMERATE = gTotal_frames;
		gTotal_frames = 0;
		gTimer_fps = 0;
	}

}


function timestamp() {
	return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
}
