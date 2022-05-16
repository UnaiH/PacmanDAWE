// >=test1
// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
var w = canvas.width;
var h = canvas.height;

// >=test1
// GAME FRAMEWORK 
var GF = function(){

	// >=test2
 	// variables para contar frames/s, usadas por measureFPS
	var frameCount = 0;
	var lastTime;
	var fpsContainer;
	var fps; 
 	
 	// >=test4
	//  variable global temporalmente para poder testear el ejercicio
	inputStates = {
		left: false,
    		right: false,
    		up: false,
    		down: false,
    		space: false,
	};

	// >=test10
	const TILE_WIDTH=24, TILE_HEIGHT=24;
	var numGhosts = 4;
	var ghostcolor = {};
	ghostcolor[0] = "rgba(255, 0, 0, 255)";
	ghostcolor[1] = "rgba(255, 128, 255, 255)";
	ghostcolor[2] = "rgba(128, 255, 255, 255)";
	ghostcolor[3] = "rgba(255, 128, 0,   255)";
	ghostcolor[4] = "rgba(50, 50, 255,   255)"; // blue, vulnerable ghost
	ghostcolor[5] = "rgba(255, 255, 255, 255)"; // white, flashing ghost
	
	// >=test10
	// hold ghost objects
	var ghosts = {};
	
	// >=test10
	var Ghost = function(id, ctx){

		this.x = 0;
		this.y = 0;
		this.velX = 0;
		this.velY = 0;
		this.speed = 1;
		
		this.nearestRow = 0;
		this.nearestCol = 0;
	
		this.ctx = ctx;
	
		this.id = id;
		this.homeX = 0;
		this.homeY = 0;

		this.state = 0;

		this.draw = function(){
			// test10
			// Tu código aquí
			// Pintar cuerpo de fantasma	
			// Pintar ojos 

			if (this.state != Ghost.SPECTACLES) {
				var color;
      				if (this.state == Ghost.NORMAL) {
        				color = ghostcolor[this.id];
      				}
				else if (this.state == Ghost.VULNERABLE) {
        				if (thisGame.ghostTimer >= 100) {
          					color = ghostcolor[4];
        				}
					else {
          					var timer = Math.floor(thisGame.ghostTimer / 10);
          					if (timer % 2 != 0) {
            						color = ghostcolor[5];
          					}
						else {
            						color = ghostcolor[4];
          					}
       	 				}
      				}

				this.ctx.beginPath();
      				this.ctx.moveTo(this.x+TILE_WIDTH/8, this.y+TILE_HEIGHT/8*3);
      				this.ctx.quadraticCurveTo(this.x+TILE_WIDTH/8*2, this.y, this.x+TILE_WIDTH/8*3, this.y+TILE_HEIGHT/8*3);
      				this.ctx.quadraticCurveTo(this.x+TILE_WIDTH/8*4, this.y, this.x+TILE_WIDTH/8*5, this.y+TILE_HEIGHT/8*3);
      				this.ctx.lineTo(this.x+player.radius*2, this.y+player.radius*2);
      				this.ctx.lineTo(this.x, this.y+player.radius*2);
      				this.ctx.closePath();
      				this.ctx.strokeStyle = color;
      				this.ctx.stroke();
      				this.ctx.fillStyle = color;
      				this.ctx.fill();
			}

      			this.ctx.beginPath();
      			this.ctx.arc(this.x+TILE_WIDTH/8, this.y+player.radius, TILE_WIDTH/8, 0, 2*Math.PI);
      			this.ctx.arc(this.x+TILE_WIDTH/8*3, this.y+player.radius, TILE_WIDTH/8, 0, 2*Math.PI);
      			this.ctx.closePath();
      			this.ctx.strokeStyle = "white";
      			this.ctx.stroke();
      			this.ctx.fillStyle = "white";
      			this.ctx.fill();	
		
			// test12 
			// Tu código aquí
			// Asegúrate de pintar el fantasma de un color u otro dependiendo del estado del fantasma y de thisGame.ghostTimer
			// siguiendo el enunciado

			// test13 
			// Tu código aquí
			// El cuerpo del fantasma sólo debe dibujarse cuando el estado del mismo es distinto a Ghost.SPECTACLES

		}; // draw
		
		this.move = function() {
			// test10
			// Tu código aquí

			if (this.state != Ghost.SPECTACLES) {
				var x2 = this.x + thisGame.TILE_WIDTH - 1,
        				y2 = this.y + thisGame.TILE_HEIGHT - 1,
        				colLeft = Math.floor(this.x / thisGame.TILE_WIDTH),
        				colRight = Math.floor(x2 / thisGame.TILE_WIDTH),
        				rowUp = Math.floor(this.y / thisGame.TILE_HEIGHT),
        				rowDown = Math.floor(y2 / thisGame.TILE_HEIGHT);

      				if (colLeft == colRight && rowUp == rowDown) {
        				var movs = [
            						[-1, 0],
            						[1, 0],
            						[0, -1],
            						[0, 1]
          					],
          					sols = [];
        				for (var i = 0; i < movs.length; i++) {
          					var mov = movs[i];
          					var possibleX = this.x + this.speed * mov[0];
          					var possibleY = this.y + this.speed * mov[1];
          					if (possibleX >= 0 && possibleX <= TILE_WIDTH * (thisLevel.lvlWidth - 1) && possibleY >= 0 && possibleY <= TILE_HEIGHT * (thisLevel.lvlHeight - 1) && !thisLevel.checkIfHitWall(possibleX, possibleY, this.nearestRow, this.nearestCol)) {
            						sols.push(mov);
          					}
        				}
        				var fork = false,
          					cont = 0;
        				while (!fork && cont < sols.length) {
          					var mov = sols[cont];
          					var ind = movs.indexOf(mov);
          					var inds;
          					if (ind == 0 || ind == 1) {
            						inds = [2, 3];
          					} else if (ind == 2 || ind == 3) {
            						inds = [0, 1];
          					}
          					if (sols.includes(movs[inds[0]]) || sols.includes(movs[inds[1]])) {
            						fork = true;
          					}
          					cont++;
        				}
        				var possibleX = this.x + this.velX;
        				var possibleY = this.y + this.velY;
        				if (possibleX < 0 || possibleX > TILE_WIDTH * (thisLevel.lvlWidth - 1) || possibleY < 0 || possibleY > TILE_HEIGHT * (thisLevel.lvlHeight - 1) || thisLevel.checkIfHitWall(possibleX, possibleY, this.nearestRow, this.nearestCol) || fork) {
          					var rand = Math.floor(Math.random() * sols.length);
          					var mov = sols[rand];

          					this.velX = this.speed * mov[0];
          					this.velY = this.speed * mov[1];
        				}
      				}
			}
			else {
        			var diffX = this.homeX - this.x,
          				diffY = this.homeY - this.y;
        			if (diffX == 0) {
          				this.velX = 0;
        			}
				else if (diffX > 0) {
          				this.velX = this.speed;
        			}
				else {
          				this.velX = -this.speed;
        			}
        			if (diffY == 0) {
          				this.velY = 0;
        			}
				else if (diffY > 0) {
          				this.velY = this.speed;
        			}
				else {
          				this.velY = -this.speed;
        			}
      			}

      			this.x = this.x + this.velX;
      			this.y = this.y + this.velY;

      			if (this.state == Ghost.SPECTACLES && this.x == this.homeX && this.y == this.homeY) {
        			this.state = Ghost.NORMAL;
      			}
		
			// test13 
			// Tu código aquí
			// Si el estado del fantasma es Ghost.SPECTACLES
			// Mover el fantasma lo más recto posible hacia la casilla de salida
		};

	}; // fin clase Ghost
	
	// >=test12
	// static variables
	Ghost.NORMAL = 1;
	Ghost.VULNERABLE = 2;
	Ghost.SPECTACLES = 3;

	// >=test5
	var Level = function(ctx) {
		this.ctx = ctx;
		this.lvlWidth = 0;
		this.lvlHeight = 0;
		
		this.map = [];
		
		this.pellets = 0;
		this.powerPelletBlinkTimer = 0;

		this.setMapTile = function(row, col, newValue){
			// test5
			// Tu código aquí

			this.map[row*this.lvlWidth+col] = newValue;

		};

		this.getMapTile = function(row, col){
			// test5
			// Tu código aquí

			return this.map[row*this.lvlWidth+col];
	
		};

		this.printMap = function(){
			// test5
			// Tu código aquí

			for (var row=0; row<this.lvlHeight; row++) {
				for (var col=0; col<this.lvlWidth; col++) {
        				var value = this.getMapTile(row, col);
          				console.log("row: " + row + ", col: " + col + ", value: " + value);
        			}
      			}

		};

		this.loadLevel = function(){
			// test5
			// Tu código aquí
			// leer res/levels/1.txt y guardarlo en el atributo map	
			// haciendo uso de setMapTile

			var direccion = "https://raw.githubusercontent.com/AinhoY/froga/main/1.txt";
      			var level = this;
      			$.ajax({url:direccion,success:function(result){

        			var r2 = JSON.stringify(result);
        			var r3 = r2.split("\\n");

        			level.lvlWidth = r3[0].split(" ")[2];
        			level.lvlHeight = r3[1].split(" ")[2];
        			for (var row=0; row<level.lvlHeight; row++) {
        				var row2 = r3[row+4].trim().split(" ");
          				for (var col=0; col<level.lvlWidth; col++) {
            					var value = row2[col];
						if (value==4) {
                					player.homeX = col*thisGame.TILE_WIDTH;
              						player.homeY = row*thisGame.TILE_HEIGHT;
              					}
						else if (value == 2) {
                					level.pellets++;
              					}
            					else if (value>=10 && value<=13) {
							var ghost = ghosts[value-10];
            						ghost.homeX = col*thisGame.TILE_WIDTH;
              						ghost.homeY = row*thisGame.TILE_HEIGHT;
            					}
            					level.setMapTile(row, col, value);
          				}
        			}

				reset();

			}});
		
			// test10
			// Tu código aquí
		};

		// >=test6
         	this.drawMap = function(){

			var TILE_WIDTH = thisGame.TILE_WIDTH;
			var TILE_HEIGHT = thisGame.TILE_HEIGHT;

			var tileID = {
				'doorH' : 20,
				'doorV' : 21,
				'pelletPower' : 3,
        			'pacman' : 4,
        			'empty' : 0,
        			'pellet' : 2,
			};
			// test6
			// Tu código aquí
      
      			ctx.beginPath();
      			ctx.rect(0, 0, w, h);
      			ctx.closePath();
      			ctx.strokeStyle = "black";
      			ctx.stroke();
      			ctx.fillStyle = "black";
      			ctx.fill();
      
      			for (var row=0; row<this.lvlHeight; row++) {
				for (var col=0; col<this.lvlWidth; col++) {
        				var value = this.getMapTile(row, col);
         				if (value>=100 && value<=199) {
          					ctx.beginPath();
            					ctx.rect(col*TILE_WIDTH, row*TILE_HEIGHT, TILE_WIDTH, TILE_HEIGHT);
            					ctx.closePath();
            					ctx.strokeStyle = "blue";
            					ctx.stroke();
            					ctx.fillStyle = "blue";
            					ctx.fill();
          				}
          				else if (value==tileID.pellet) {
          					ctx.beginPath();
            					ctx.arc((col+0.5)*TILE_WIDTH, (row+0.5)*TILE_HEIGHT, player.radius/2, 0, 2*Math.PI);
            					ctx.closePath();
            					ctx.strokeStyle = "white";
            					ctx.stroke();
            					ctx.fillStyle = "white";
            					ctx.fill();
          				}
          				else if (value==tileID.pelletPower && this.powerPelletBlinkTimer<30) {
          					ctx.beginPath();
            					ctx.arc((col+0.5)*TILE_WIDTH, (row+0.5)*TILE_HEIGHT, player.radius/2, 0, 2*Math.PI);
            					ctx.closePath();
            					ctx.strokeStyle = "red";
            					ctx.stroke();
            					ctx.fillStyle = "red";
            					ctx.fill();
          				}
          
        			}
			}
      
      			this.powerPelletBlinkTimer++;
      			if (this.powerPelletBlinkTimer==60) {
      				this.powerPelletBlinkTimer = 0;
      			}
      
		};

		// >=test7
		this.isWall = function(row, col) {
			// test7
			// Tu código aquí

			var value = this.getMapTile(row, col);
      			return value >= 100 && value <= 199;

		};

		// >=test7
		this.checkIfHitWall = function(possiblePlayerX, possiblePlayerY, row, col){
			// test7
			// Tu código aquí
			// Determinar si el jugador va a moverse a una fila,columna que tiene pared 
			// Hacer uso de isWall

			var possiblePlayerX2 = possiblePlayerX + thisGame.TILE_WIDTH - 1,
          			possiblePlayerY2 = possiblePlayerY + thisGame.TILE_HEIGHT - 1,
          			colLeft = Math.floor(possiblePlayerX / thisGame.TILE_WIDTH),
          			colRight = Math.floor(possiblePlayerX2 / thisGame.TILE_WIDTH),
          			rowUp = Math.floor(possiblePlayerY / thisGame.TILE_HEIGHT),
          			rowDown = Math.floor(possiblePlayerY2 / thisGame.TILE_HEIGHT),
          			cols = [colLeft],
          			rows = [rowUp];

      			if (colLeft != colRight) {
        			cols[1] = colRight;
      			}
      			if (rowUp != rowDown) {
        			rows[1] = rowDown;
      			}

      			for (var i = 0; i < rows.length; i++) {
        			var r = rows[i];
        			for (var j = 0; j < cols.length; j++) {
          				var c = cols[j];
          				if (this.isWall(r, c)) {
            					return true;
          				}
        			}
      			}

      			return false;

		};
		
		// >=test11
		this.checkIfHit = function(playerX, playerY, x, y, holgura){
			// Test11
			// Tu código aquí	
      
      			return Math.abs(playerX-x)<holgura && Math.abs(playerY-y)<holgura;
		};

		// >=test8
		this.checkIfHitSomething = function(playerX, playerY, row, col){
			var tileID = {
        			'doorH': 20,
        			'doorV': 21,
        			'pelletPower': 3,
        			'pacman': 4,
        			'empty': 0,
        			'pellet': 2,
      			};

			// test8
      			// Tu código aquí
      			//  Gestiona la recogida de píldoras

      			var playerX2 = playerX + thisGame.TILE_WIDTH - 1,
        			playerY2 = playerY + thisGame.TILE_HEIGHT - 1,
        			colLeft = Math.floor(playerX / thisGame.TILE_WIDTH),
        			colRight = Math.floor(playerX2 / thisGame.TILE_WIDTH),
        			rowUp = Math.floor(playerY / thisGame.TILE_HEIGHT),
        			rowDown = Math.floor(playerY2 / thisGame.TILE_HEIGHT),
        			cols = [colLeft],
        			rows = [rowUp];

      			if (colLeft != colRight) {
        			cols[1] = colRight;
      			}
      			if (rowUp != rowDown) {
        			rows[1] = rowDown;
      			}

      			for (var i = 0; i < rows.length; i++) {
        			var r = rows[i];
        			for (var j = 0; j < cols.length; j++) {
          				var c = cols[j];
          				var value = this.getMapTile(r, c);
          				if (value == tileID.pellet) {
            					this.setMapTile(r, c, 0);
            					this.pellets--;
            					thisGame.addToScore(10);
            					if (this.pellets == 0) {
              						console.log("Next level!");
            					}
          				}
					else if (value == tileID.doorH) {
						if (c == 0) {
              						player.x = (this.lvlWidth - 2) * thisGame.TILE_WIDTH;
            					}
            					else if (c == this.lvlWidth - 1) {
              						player.x = thisGame.TILE_WIDTH;
            					}
          				}
					else if (value == tileID.doorV) {
						if (r == 0) {
              						player.y = (this.lvlHeight - 2) * thisGame.TILE_HEIGHT;
            					}
            					else if (r == this.lvlHeight - 1) {
              						player.y = thisGame.TILE_HEIGHT;
            					}
          				}
					else if (value == tileID.pelletPower) {
            					this.setMapTile(r, c, 0);
            					for (var i = 0; i < numGhosts; i++) {
              						var ghost = ghosts[i];
              						if (ghost.state == Ghost.NORMAL) {
                						ghost.state = Ghost.VULNERABLE;
              						}
            					}
            					thisGame.ghostTimer = 360;
            					thisGame.addToScore(50);
          				}
        			}
      			}
			
			// test9
			// Tu código aquí
			// Gestiona las puertas teletransportadoras
			
			// test12
			// Tu código aquí
			// Gestiona la recogida de píldoras de poder
			// (cambia el estado de los fantasmas)

		};

	}; // end Level 
	
	// >=test2
	var Pacman = function() {
		this.radius = 10;
		this.x = 0;
		this.y = 0;
		this.speed = 3;
		this.angle1 = 0.25;
		this.angle2 = 1.75;
    		this.velX = 0;
    		this.velY = 0;
    		this.homeX = 0;
    		this.homeY = 0;
    		this.nearestRow = 0;
    		this.nearestCol = 0;
	};
	
	// >=test3
	Pacman.prototype.move = function() {
	
		// test3 / test4 / test7
		// Tu código aquí

		if (this.velX != 0) {
      			if (this.x + this.velX >= 0 && this.x + this.velX <= thisGame.TILE_WIDTH * (thisLevel.lvlWidth - 1) && !thisLevel.checkIfHitWall(this.x + this.velX, this.y, this.nearestRow, this.nearestCol)) {
        			this.x = this.x + this.velX;
      			}
			else {
        			this.velX = 0;
      			}
    		}
    		else if (this.velY != 0) {
      			if (this.y + this.velY >= 0 && this.y + this.velY <= thisGame.TILE_HEIGHT * (thisLevel.lvlHeight - 1) && !thisLevel.checkIfHitWall(this.x, this.y + this.velY, this.nearestRow, this.nearestCol)) {
        			this.y = this.y + this.velY;
      			}
			else {
        			this.velY = 0;
      			}
    		}
		
		// >=test8: introduce esta instrucción 
		// dentro del código implementado en el test7:
		// tras actualizar this.x  y  this.y... 
		// check for collisions with other tiles (pellets, etc)
		 thisLevel.checkIfHitSomething(this.x, this.y, this.nearestRow, this.nearestCol);
		
		// test11
		// Tu código aquí
		// check for collisions with the ghosts

		for (var i=0; i< numGhosts; i++){
      			var ghost = ghosts[i];
      			if(thisLevel.checkIfHit(this.x, this.y, ghost.x, ghost.y, TILE_WIDTH/2)) {
      				console.log("Hay choque");
        			if (ghost.state == Ghost.VULNERABLE) {
          				ghost.state = Ghost.SPECTACLES;
          				thisGame.addToScore(2 ^ thisGame.vulnerableGhostsHitted * 200);
          				thisGame.vulnerableGhostsHitted++;
        			}
        			else if (ghost.state == Ghost.NORMAL) {
          				thisGame.setMode(thisGame.HIT_GHOST);
        			}
      			}
    		}
		
		// test13 
		// Tu código aquí 
		// Si chocamos contra un fantasma y su estado es Ghost.VULNERABLE
		// cambiar velocidad del fantasma y pasarlo a modo Ghost.SPECTACLES
		
		// test14 
		// Tu código aquí. 
		// Si chocamos contra un fantasma cuando éste esta en estado Ghost.NORMAL --> cambiar el modo de juego a HIT_GHOST

	};
	
	// >=test2
	// Función para pintar el Pacman
	// En el test2 se llama drawPacman(x, y) {
	Pacman.prototype.draw = function(x, y) {
         
		// Pac Man
		// test2   
		// Tu código aquí
		// ojo: en el test2 esta función se llama drawPacman(x,y))

		ctx.beginPath();
		ctx.arc(this.x+this.radius, this.y+this.radius, this.radius, this.angle1*Math.PI, this.angle2*Math.PI);
		ctx.lineTo(this.x+this.radius, this.y+this.radius);
    		ctx.closePath();
    		ctx.strokeStyle = "black";
    		ctx.stroke();
    		ctx.fillStyle = "yellow";
    		ctx.fill();

    	};
    	
    	// >=test5
	var player = new Pacman();
	
	// >=test10
	for (var i=0; i< numGhosts; i++){
		ghosts[i] = new Ghost(i, canvas.getContext("2d"));
	}
 
	// >=test5
	var thisGame = {
		getLevelNum : function(){
			return 0;
		},
		
		// >=test14
	        setMode : function(mode) {
			this.mode = mode;
			this.modeTimer = 0;
		},
		
		// >=test6
		screenTileSize: [24, 21],
		
		// >=test5
		TILE_WIDTH: 24, 
		TILE_HEIGHT: 24,
		
		// >=test12
		ghostTimer: 0,
		
		// >=test14
		NORMAL : 1,
		HIT_GHOST : 2,
		GAME_OVER : 3,
		WAIT_TO_START: 4,
		modeTimer: 0,
    		lifes: 3,
    		points: 0,
    		highscore: 0,
    		addToScore: function(puntos_a_sumar) {
      			this.points = this.points + puntos_a_sumar;
    		},
    		vulnerableGhostsHitted: 0
	};
	
       // >=test5
	var thisLevel = new Level(canvas.getContext("2d"));
	thisLevel.loadLevel( thisGame.getLevelNum() );
	// thisLevel.printMap(); 
	
	// >=test2
	var measureFPS = function(newTime){
		// la primera ejecución tiene una condición especial

		if(lastTime === undefined) {
			lastTime = newTime; 
			return;
		}

		// calcular el delta entre el frame actual y el anterior
		var diffTime = newTime - lastTime; 

		if (diffTime >= 1000) {

			fps = frameCount;    
			frameCount = 0;
			lastTime = newTime;
		}

		// mostrar los FPS en una capa del documento
		// que hemos construído en la función start()
		fpsContainer.innerHTML = 'FPS: ' + fps; 
		frameCount++;
	};
	
	// >=test3
	// clears the canvas content
	var clearCanvas = function() {
		ctx.clearRect(0, 0, w, h);
	};

	// >=test4
	var checkInputs = function(){
		
		// test4
		// Tu código aquí (reestructúralo para el test7)
		
		var velX = player.velX,
        		velY = player.velY;
    
    		if (inputStates.left) {
      			player.velX = -player.speed;
      			player.velY = 0;
    		}
    		else if (inputStates.right) {
      			player.velX = player.speed;
      			player.velY = 0;
    		}
    		else if (inputStates.up) {
      			player.velX = 0;
      			player.velY = -player.speed;
    		}
    		else if (inputStates.down) {
      			player.velX = 0;
      			player.velY = player.speed;
    		}
		
		// test7
		// Tu código aquí
		// LEE bien el enunciado, especialmente la nota de ATENCION que
		// se muestra tras el test 7
    
    		if (thisLevel.checkIfHitWall(player.x+player.velX, player.y+player.velY, player.nearestRow, player.nearestCol)) {
    			player.velX = velX;
      			player.velY = velY;
    		}

	};

	// >=test12
	var updateTimers = function(){
		// test12
		// Tu código aquí
        	// Actualizar thisGame.ghostTimer (y el estado de los fantasmas, tal y como se especifica en el enunciado)

		if (thisGame.ghostTimer != 0) {
      			thisGame.ghostTimer--;
      			if (thisGame.ghostTimer == 0) {
        			for (var i = 0; i < numGhosts; i++) {
          				var ghost = ghosts[i];
          				if (ghost.state == Ghost.VULNERABLE) {
            					ghost.state = Ghost.NORMAL;
          				}
        			}
        			thisGame.vulnerableGhostsHitted = 0;
      			}
    		}

		// test14
		// Tu código aquí
		// actualiza modeTimer...
    
    		thisGame.modeTimer++;
	};

	var displayScore = function() {
    		ctx.font = "15px Arial";

    		ctx.fillStyle = "red";
    		ctx.fillText("LIFES", TILE_WIDTH, TILE_HEIGHT / 4 * 3);
    		ctx.fillStyle = "white";
    		ctx.fillText(thisGame.lifes, TILE_WIDTH * 3, TILE_HEIGHT / 4 * 3);

    		ctx.fillStyle = "red";
    		ctx.fillText("POINTS", TILE_WIDTH * 4, TILE_HEIGHT / 4 * 3);
    		ctx.fillStyle = "white";
    		ctx.fillText(thisGame.points, TILE_WIDTH * 7, TILE_HEIGHT / 4 * 3);

    		ctx.fillStyle = "red";
    		ctx.fillText("HIGH SCORE", TILE_WIDTH * 13, TILE_HEIGHT / 4 * 3);
    		ctx.fillStyle = "white";
    		ctx.fillText(thisGame.highscore, TILE_WIDTH * 18, TILE_HEIGHT / 4 * 3);
	};
	
	// >=test1
	var mainLoop = function(time){
    
		// test1 
		// Tu codigo aquí (solo tu código y la instrucción requestAnimationFrame(mainLoop);)
		// A partir del test2 deberás borrar lo implementado en el test1
		
    		// >=test2
		// main function, called each frame 
		measureFPS(time);

		if (thisGame.mode != thisGame.GAME_OVER) {     
			// test14
			// Tu código aquí
			// sólo en modo NORMAL
		
			if (thisGame.mode==thisGame.NORMAL) {
				// >=test4
				checkInputs();
		
				// test10
				// Tu código aquí
				// Mover fantasmas

				for (var i=0; i< numGhosts; i++){
      					ghosts[i].move();
    				}
		
				// >=test3
				//ojo: en el test3 esta instrucción es pacman.move()
				player.move();
			}


			// test14
			// Tu código aquí
			// en modo HIT_GHOST
			// seguir el enunciado...

			if (thisGame.mode==thisGame.HIT_GHOST && thisGame.modeTimer==90) {
				thisGame.lifes--;
        			if (thisGame.lifes != 0) {
    					reset();
      					thisGame.setMode(thisGame.WAIT_TO_START);
				}
				else {
          				thisGame.setMode(thisGame.GAME_OVER);
        			}
    			}
	
			// test14	
			// Tu código aquí
			// en modo WAIT_TO_START
			// seguir el enunciado...

			if (thisGame.mode==thisGame.WAIT_TO_START && thisGame.modeTimer==30) {
      				thisGame.setMode(thisGame.NORMAL);
    			}	

			// >=test2
			// Clear the canvas
			clearCanvas();
   
   			// >=test6
			thisLevel.drawMap();

			// test10
			// Tu código aquí
			// Pintar fantasmas

			for (var i=0; i< numGhosts; i++){
      				ghosts[i].draw();
    			}

			// >=test3
			//ojo: en el test3 esta instrucción es pacman.draw()
			player.draw();
		
			// >=test12
			updateTimers();
		}
		else {
      			clearCanvas();

      			ctx.beginPath();
      			ctx.rect(0, 0, w, h);
      			ctx.closePath();
      			ctx.strokeStyle = "black";
      			ctx.stroke();
      			ctx.fillStyle = "black";
      			ctx.fill();

      			ctx.font = "30px Arial";
      			ctx.fillStyle = "red";
      			ctx.fillText("GAME OVER", (w - 9 * 25) / 2, h / 2);
    		}

    		displayScore();
		
		// call the animation loop every 1/60th of second
		// comentar esta instrucción en el test3
		requestAnimationFrame(mainLoop);
	};
	
	// >=test4
	var addListeners = function(){
    
		// add the listener to the main, window object, and update the states
		// test4
		// Tu código aquí

		function habilitarGestor() {
      			window.addEventListener('keydown', keyDown, false);
      			window.addEventListener('keydown', disableScroll, false);
      			window.addEventListener('keyup', keyUp, false);
      			window.addEventListener('keyup', disableScroll, false);
    		}

    		function deshabilitarGestor() {
      			window.removeEventListener('keydown', keyDown, false);
      			window.removeEventListener('keydown', disableScroll, false);
      			window.removeEventListener('keyup', keyUp, false);
      			window.removeEventListener('keyup', disableScroll, false);
   		}

    		window.onload = habilitarGestor;
    		window.onblur = deshabilitarGestor;
    		window.onfocus = habilitarGestor;

    		function keyDown(e) {
      			const keyName = e.key;
      			if (keyName === 'ArrowLeft') {
        			inputStates.left = true;
      			} else if (keyName === 'ArrowRight') {
        			inputStates.right = true;
      			} else if (keyName === 'ArrowUp') {
        			inputStates.up = true;
      			} else if (keyName === 'ArrowDown') {
        			inputStates.down = true;
      			} else if (keyName === ' ') {
        			console.log(`Space pressed`);
      			}
    		}

    		function keyUp(e) {
      			const keyName = e.key;
      			if (keyName === 'ArrowLeft') {
       	 			inputStates.left = false;
      			} else if (keyName === 'ArrowRight') {
        			inputStates.right = false;
      			} else if (keyName === 'ArrowUp') {
        			inputStates.up = false;
      			} else if (keyName === 'ArrowDown') {
        			inputStates.down = false;
      			}
    		}

    		function disableScroll(e) {
      			if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].indexOf(e.code) > -1) {
        			event.preventDefault();
      			}
    		}

	};
	
	
	//>=test7
	var reset = function(){
	
		// test12
		// Tu código aquí
		// probablemente necesites inicializar los atributos de los fantasmas
		// (x,y,velX,velY,state, speed)
		
		// test7
		// Tu código aquí
		// Inicialmente Pacman debe empezar a moverse en horizontal hacia la derecha, con una velocidad igual a su atributo speed
		// inicializa la posición inicial de Pacman tal y como indica el enunciado

		player.x = player.homeX;
		player.y = player.homeY; 
		player.velX = player.speed;
		player.velY = 0;
	
		// test10
		// Tu código aquí
		// Inicializa los atributos x,y, velX, velY, speed de la clase Ghost de forma conveniente

		for (var i=0; i< numGhosts; i++){
    			var ghost = ghosts[i];
      			ghost.x = ghost.homeX;
      			ghost.y = ghost.homeY;
      			ghost.velX = ghost.speed;
      			ghost.velY = 0;
      			ghost.speed = 1;
      			ghost.state = Ghost.NORMAL;
    		}
		
		// >=test14
		thisGame.setMode( thisGame.NORMAL);
	};
	
	// >=test1
	var start = function(){
	
		// >=test2
		// adds a div for displaying the fps value
		fpsContainer = document.createElement('div');
		document.body.appendChild(fpsContainer);
       	
       	// >=test4
		addListeners();

		// >=test7
		reset();

		// start the animation
		requestAnimationFrame(mainLoop);
	};

	// >=test1
	//our GameFramework returns a public API visible from outside its scope
	return {
		start: start,
		
		// solo para el test 10 
		ghost: Ghost,  // exportando Ghost para poder probarla
		
		// solo para estos test: test12 y test13
		ghosts: ghosts, 
		
		// solo para el test12
		thisLevel: thisLevel
		
		// solo para el test 13
		Ghost: Ghost
		
		// solo para el test14
		thisGame: thisGame
	};
};

// >=test1
var game = new GF();
game.start();




