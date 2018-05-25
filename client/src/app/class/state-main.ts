import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';

import { Position } from './position';
import { Food } from './food';

import { Global } from '../enum/global';
import { GameState } from '../enum/game-state';

let styleScore = {
    font: 'bold 16pt Arial',
    fill: '#000000',       
};

let stylePositionClick = {
    font: 'bold 8pt Arial', 
    fill: '#000000',
    align: 'center'
};

export class StateMain extends Phaser.State {
    
    // Variables principales
    private _game: Phaser.Game;
    private _player: Phaser.Sprite; 
    private _map: Phaser.Tilemap;
    private _layerBackground: Phaser.TilemapLayer;
    private _layerObject: Phaser.TilemapLayer;
    private _layerCollision: Phaser.TilemapLayer;
    // Variables sonido
    private _soundMain: Phaser.Sound;        
    private _soundFood: Phaser.Sound;
    // Variable configuración
    private _canvasH: number;
    private _canvasW: number;
    private _scoreH: number;
    private _velocity: number;
    private _sizeSprite: number;
    private _sizePlayer: Array<number>;
    private _widthHealthBar: number;
    private _posInitial: Position;
    private _healthMax: number;
    private _timeMax: number;
    private _volume: boolean;
    private _numLevel: number;
    // Variables file BBDD
    private _filePlayer: string;
    private _fileMap: string;
    private _fileTiledset: string;
    // Variables para intercambio de información con game.ts
    private _stateGame: GameState;
    private _wait: boolean; 
    private _msgError: string;
    // Variables objetivo
    private _goals: Array<[string, boolean]>;
    private _index: number;        
    private _posGoal: Position;    
    private _indexPos: number;
    private _coinGoal: number;
    private _indexCoin: number;
    private _deathGoal: number;
    private _indexDeath: number;
    private _foodGoal: number;
    private _foodAll: boolean;
    private _indexFood: number;
    private _indexFoodAll: number;
    // Variables objetivos temporales
    private _posGoalTmp: Position;
    // Variables grupos de objetos
    private _groupPosition: Array<Position>;
    private _groupCoin: Phaser.Group;
    private _groupDeath: Phaser.Group;
    private _groupFood: Phaser.Group;
    // Variables canvas: posición click    
    private _clickImage: Phaser.Image;
    private _clickText: Phaser.Text;
    // Variables canvas: health
    private _healthCurrent: number;
    private _healthBar: Phaser.Sprite;        
    // Variables canvas: coin
    private _coinCurrent: number;
    private _coinText: Phaser.Text;
    // Variables canvas: death
    private _deathCurrent: number;
    private _deathText: Phaser.Text;
    // Variables canvas: food
    private _foodCurrent: number;
    private _foodText: Phaser.Text;  
    // Variables canvas: tiempo
    private _timeCurrent: number;
    private _timeText: Phaser.Text;
    private _timeEvent: Phaser.Event;
    
    
    constructor() {
        super();        
        this._canvasW = 450;
        this._canvasH = 375;
        this._scoreH = 75;        
        this._velocity = 64;
        this._widthHealthBar = 250; 
        this._sizeSprite = 32; 
        this._sizePlayer = new Array<number>(32, 32);
        this._volume = true;     
        this._goals = new Array<[string, boolean]> ();
        this._foodAll = false;   
        this._index = 0;

        this._game = new Phaser.Game(576, 480, Phaser.CANVAS, Global.id_canvas);
        this._game.state.add('gameplay', this);
        this._game.state.start('gameplay');
    }

    // Propiedades
    
    set stateGame (s: GameState) {
        
        let interval;
        this._stateGame = s; 
        
        switch (s) {
            case GameState.Init:                
                this._game.paused = true; 
                this._wait = false;                
                this._msgError = null;               
                break;
            case GameState.Run:
                this._game.paused = false; 
                this._soundMain.play();               
                break;        
            case GameState.Pause:
                this._game.paused = true;
                break;
            case GameState.LevelUp:                  
                this._game.paused = true; 
                break;
            case GameState.GameOver:
                this._soundMain.stop();
                this._game.paused = true;                                   
                break;             
        }        
    }

    set groupFood (g: Phaser.Group) {
        this._groupFood  = g;
    }

    get game () {
        return this._game;
    }

    get player () {
        return this._player;
    }

    get sizeSprite () {
        return this._sizeSprite;
    }

    get sizePlayer_x () {
        return this._sizePlayer[0];
    }

    get sizePlayer_y () {
        return this._sizePlayer[1];
    }

    get sizeCanvas() {
        return [this._canvasW, this._canvasH];
    }

    get volume () {
        return this._volume;
    }

    get numLevel () {
        return this._numLevel;
    }

    get posInitial () {
        return this._posInitial;
    }

    get posGoalTmp () {
        return this._posGoalTmp;
    }

    get stateGame () {
        return this._stateGame;
    }

    get wait () {
        return this._wait;
    }

    get msgError () {
        return this._msgError;
    }

    get goals() {
        return this._goals;
    }

    get foodGoal() {
        return this._foodGoal;
    }

    get groupPosition () {
        return this._groupPosition;
    }

    get groupCoin () {
        return this._groupCoin;
    }

    get groupDeath () {
        return this._groupDeath;
    }

    get groupFood () {
        return this._groupFood;
    }   
    
    get foodCurrent() {        
        return this._foodCurrent;
    }

    // Funciones de carga

    loadFile (file_P, file_M, file_T) {
        this._filePlayer = file_P;
        this._fileMap = file_M;
        this._fileTiledset = file_T;
    }

    loadConfigure (time, health, playerW, playerH, n) {
        this._timeMax = time;
        this._healthMax = health;
        this._numLevel = n;

        if (playerW) {
            this._sizePlayer[0] = playerW;
        }

        if (playerH) {
            this._sizePlayer[1] = playerH;
        }

    }

    loadGoal(title, key, v1, v2) {            
        
        let msg;

        switch (key) {
            case 'POSITION':                
                this._posGoal = new Position(v1, v2);
                msg = title + ': (' + v1 + ',' + v2 + ')';
                this._indexPos = this._index;
                break;
            case 'FOOD':
                this._foodGoal = v1;
                msg = title + ': ' + v1;
                this._indexFood = this._index;
                break;
            case 'FOOD_ALL':
                this._foodAll = true;
                msg = title;         
                this._indexFoodAll = this._index;       
                break;
        }        
        this._goals.push([msg, false]);        
        this._index ++;        
    }

    loadPositionPlayer (v1, v2) {
        this._posInitial = new Position(v1, v2);
    }

    loadPosition (v1, v2) { 
        let p = new Position(v1, v2);            

        if (!this._groupPosition) {
            this._groupPosition = new Array<Position>();
        }

        this._groupPosition.push(p);        
    }

    loadResource (name, path) {
        this._game.load.image(name, Global.url_resource + path);
    }

    loadGroup () {
        return this._game.add.physicsGroup();
    }

    // Funciones básicas Phaser.State

    reload() {
        // Estado del juego
        this.stateGame = GameState.Init;

        // Jugador
        this._player.x = this._posInitial.x - (this.sizePlayer_x / 2);
        this._player.y = this._posInitial.y - (this.sizePlayer_y / 2);
        this.stopPlayer();
        this._game.world.bringToTop(this._player);
        
        // Posiciones
        this._posGoalTmp = null;

        // Evento tiempo
        this._game.time.events.remove(this._timeEvent);       
        this._timeEvent = this._game.time.events.loop(Phaser.Timer.SECOND, this.eventTime, this);

        // Objetivos conseguidos
        this._goals.forEach(g => {
            g[1] = false;
        });

        // Marcadores
        this._healthCurrent = this._healthMax;
        this._healthBar.width = (this._healthCurrent * this._widthHealthBar) / this._healthMax;        
        this._coinCurrent = 0; 
        this._coinText.text = this._coinCurrent;
        this._deathCurrent = 0;
        this._deathText.text = this._deathCurrent;
        this._foodCurrent = 0; 
        this._foodText.text = this._foodCurrent;
        this._timeCurrent = this._timeMax;
        this._timeText.text = this._timeCurrent;                            
    }

    preload() {
        // Carga map, player y tiledset        
        this._game.load.tilemap('map', Global.url_api + 'level-load/' + this._fileMap + '/M', null, Phaser.Tilemap.TILED_JSON);         
        this._game.load.spritesheet('player', Global.url_api + 'evolution-load/' + this._filePlayer + '/P', this._sizePlayer[0], this._sizePlayer[1]);         
        this._game.load.image('tiledset', Global.url_api + 'evolution-load/' + this._fileTiledset + '/T');    
        // Carga de audios
        this.game.load.audio('song-main', Global.url_sound + 'song-main.mp3');                
        this.game.load.audio('sound-food', Global.url_sound + '/sound/eating.mp3');
        // Carga burbujas de diálogo
        this._game.load.image('speech_D_C', Global.url_resource + 'object/speech_down_center.png');
        this._game.load.image('speech_D_L', Global.url_resource + 'object/speech_down_left.png');
        this._game.load.image('speech_D_R', Global.url_resource + 'object/speech_down_right.png');
        this._game.load.image('speech_U_C', Global.url_resource + 'object/speech_up_center.png');
        this._game.load.image('speech_U_L', Global.url_resource + 'object/speech_up_left.png');
        this._game.load.image('speech_U_R', Global.url_resource + 'object/speech_up_right.png');
        // Carga elementos barra marcador
        this._game.load.image('health', Global.url_resource + 'object/health.png');
        this._game.load.image('coin', Global.url_resource + 'object/coin.png');
        this._game.load.image('death', Global.url_resource + 'object/death.png');
        this._game.load.image('food', Global.url_resource + 'object/food.png');
        this._game.load.image('time', Global.url_resource + 'object/time.jpeg');                
        // Carga posicion habilitada
        if (this._groupPosition ) {
            this._game.load.image('pos', Global.url_resource + 'object/position.png');
        }            
        // Carga posición objetivo
        if (this._posGoal) {
            this._game.load.image('pos_obj', Global.url_resource + 'object/positionGoal.png');
        }
    }

    create() {
        // Elementos principales
        this._game.physics.startSystem(Phaser.Physics.ARCADE);
        this._game.stage.backgroundColor = '#FFFFFF';
        this._map = this._game.add.tilemap('map');
        this._map.addTilesetImage('tiledset', 'tiledset');
        this._layerBackground = this._map.createLayer('background');
        this._layerBackground.scale.set(0.78125);        
        this._layerObject = this._map.createLayer('object'); 
        this._layerObject.scale.set(0.78125); 
        this._layerCollision = this._map.createLayer('collision'); 
        this._layerCollision.scale.set(0.78125); 
        this._map.setCollisionBetween(1, 1000, true, this._layerCollision);

        // Player
        this._player = this._game.add.sprite(this._posInitial.x - (this.sizePlayer_x / 2), this._posInitial.y - (this.sizePlayer_y / 2), 'player', 0);           
        this._player.animations.add('right', [0, 1, 2, 3], 10, true);
        this._player.animations.add('up', [4, 5, 6, 7], 10, true);
        this._player.animations.add('left', [8, 9, 10, 11], 10, true);
        this._player.animations.add('down', [12, 13, 14, 15], 10, true);        
        this._game.physics.enable(this._player, Phaser.Physics.ARCADE);
        this._player.body.collideWorldBounds = true;
        this._player.body.onWorldBounds = new Phaser.Signal();
        this._player.body.onWorldBounds.add(this.eventCollisionBlock, this);        

        // Sonido
        this._soundMain = this._game.add.audio('song-main');
        this._soundMain.volume = 0.3;
        this._soundMain.loop = true;   
        this._soundFood = this._game.add.audio('sound-food');        
        this._soundMain.volume = 0.5;

        // Marcador: click posición
        this._game.input.onDown.add(this.eventClick, this);
        this._game.input.onUp.add(
            () => {
                if (this._clickText) {
                    this._clickText.kill();
                }   
                
                if (this._clickImage) {
                    this._clickImage.kill();
                }
            },
            this);

        // Marcador: barra de salud 
        this._game.add.image(36, this._canvasH + 10, 'health');      
        let scoreBoard = this._game.add.graphics();
        scoreBoard.lineStyle(2, 0x000000, 1);
        scoreBoard.drawRect(0, this._canvasH, this._canvasW, this._scoreH);
        let healthBoard = this._game.add.graphics();
        healthBoard.lineStyle(2, 0x000000, 1);
        healthBoard.drawRect(100, this._canvasH + 10, this._widthHealthBar + 2, (this._scoreH / 2) + 2);                  
        let bmd = this._game.add.bitmapData(this._widthHealthBar, this._scoreH / 2);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, this._widthHealthBar, this._scoreH);
        bmd.ctx.fillStyle = '#21610B';
        bmd.ctx.fill();
        this._healthBar = this._game.add.sprite(101, this._canvasH + 11, bmd);    
        
        // Marcador: coin
        this._game.add.image(this._game.width / 1.4, this._canvasH + 2, 'coin');
        this._coinText = this._game.add.text(this._game.width / 1.28, this._canvasH + 2, '', styleScore);
        // Marcador: death
        this._game.add.image(this._game.width / 1.4, this._canvasH + 30, 'death');
        this._deathText = this._game.add.text(this._game.width / 1.28, this._canvasH + 30, '', styleScore); 
        // Marcador: food
        this._game.add.image(this._game.width / 1.17, this._canvasH + 2, 'food');
        this._foodText = this._game.add.text(this._game.width / 1.1, this._canvasH + 2, '', styleScore);  
        // Marcador: time
        this._game.add.image(this._game.width / 1.16, this._canvasH + 30, 'time');
        this._timeText = this._game.add.text(this._game.width / 1.1, this._canvasH + 30, '', styleScore); 

        // Posiciones habilitadas
        if (this._groupPosition) {
            this._groupPosition.forEach( (p) => {
                let s = this._game.add.sprite(p.x - (this._sizeSprite / 2), p.y - (this._sizeSprite / 2), 'pos');
                s.width = this._sizeSprite;
                s.height = this._sizeSprite;
            });
        }
                
        // Posición objetivo
        if (this._posGoal) {
            let s = this._game.add.sprite(this._posGoal.x - (this._sizeSprite / 2), this._posGoal.y - (this._sizeSprite / 2), 'pos_obj');
            s.width = this._sizeSprite;
            s.height = this._sizeSprite;
        }                         
    }

    update() {

        // Comprobar colisión con pared
        this._game.physics.arcade.collide(this._layerCollision, this._player, this.eventCollisionBlock, null, this);

        // Comprobar objetivo temporal
        if (this._posGoalTmp) {
            let dist = this.game.physics.arcade.distanceToXY(this._player, this._posGoalTmp.x - (this.sizePlayer_x / 2) , this.posGoalTmp.y - (this.sizePlayer_y / 2));

            if (Math.round(dist) >= -1 && Math.round(dist) <= 1) {
                this.stopPlayer();                             
                delete this._posGoalTmp;
                this._wait = false;  
            } else {
                this.game.physics.arcade.moveToXY(this._player, this._posGoalTmp.x - (this.sizePlayer_x / 2) , this.posGoalTmp.y - (this.sizePlayer_y / 2), this._velocity);
            }

        }  

        // Comprobar objetivos finales
        if (this.checkGoals()) {
            this.stateGame = GameState.LevelUp;   
        }        
    }

    // Eventos

    eventClick() {
        let posX = parseInt(this._game.input.mousePointer.x, 10);
        let posY = parseInt(this._game.input.mousePointer.y, 10);    
        
        if (posY > this._canvasH) {
            return;
        }
        let messagge = 'x = ' + posX + '\ny = ' + posY;
        // Arriba centro por defecto
        let posText = new Position (posX - 15, posY - 50, true);
        let posSpeech = new Position (posX - 45, posY - 60, true);
        let image = 'speech_U_C';              
        
        // Abajo centro
        if (posY < 60 && posX > 40 && posX  < (this._game.width - 40)) {                    
            posText.y = posY + 25;
            posSpeech.x = posX - 45;
            posSpeech.y = posY;
            image = 'speech_D_C';
        }

        // Abajo izquierda
        if (posY < 60 && posX <= 40) {
            posText.x = posX + 25;
            posText.y = posY + 25;
            posSpeech.x = posX - 10;
            posSpeech.y = posY;
            image = 'speech_D_R';
        }

        // Abajo derecha
        if (posY < 60 && posX  >= (this._game.width - 40)) {
            posText.x = posX - 50;
            posText.y = posY + 25;
            posSpeech.x = posX - 85;
            posSpeech.y = posY;
            image = 'speech_D_L';
        }

        // Arriba izquierda
        if (posY >= 60 && posX <= 40) {
            posText.x = posX + 25;                    
            posSpeech.x = posX - 10;
            image = 'speech_U_R';
        }

        // Abajo derecha
        if (posY >= 60 && posX  >= (this._game.width - 40)) {
            posText.x = posX - 50;
            posSpeech.x = posX - 85;                    
            image = 'speech_U_L';
        }

        
        this._clickImage = this._game.add.sprite(posSpeech.x, posSpeech.y , image);
        this._clickText = this._game.add.text(posText.x, posText.y, messagge, stylePositionClick);
    }

    eventTime() {
        this._timeCurrent --;
        this._timeText.text = this._timeCurrent;
        if (this._timeCurrent <= 0) {
            this.eventGameOver('Fin del tiempo');                         
        }
    }

    eventCollisionBlock() {
        this.eventGameOver('Colisión');        
    }

    eventAttacked (hurt: number) {
        this._healthCurrent -= hurt;        
        if (this._healthCurrent <= 0) {
            this._healthCurrent = 0;
            this.eventGameOver('El organismo ha muerto');
        }
        this._healthBar.width = (this._healthCurrent * this._widthHealthBar) / this._healthMax;
    }

    eventGameOver (msg: string) {
        this._game.time.events.remove(this._timeEvent);         
        this._msgError = msg;
        this.stateGame = GameState.GameOver;                  
    }

    // Checked

    checkGoals() {
        let checked = true;

        // Posición objetivo
        if (this._posGoal) {
            if (!this._goals[this._indexPos][1]) {
                let p_aux = this.positionPlayer();
                if (!this._posGoal.inRange(p_aux.x, p_aux.y, 5)) {
                    checked = false;
                } else {
                    this._goals[this._indexPos][1] = true;                    
                }
            }            
        }

        // Alimentos recorridos
        if (this._foodGoal) {
            if (!this._goals[this._indexFood][1]) {
                if (this._foodGoal > this._foodCurrent) {
                    checked = false;
                } else {
                    this._goals[this._indexFood][1] = true;
                }
            }
        }

        // Todos los alimentos recogidos
        if (this._foodAll) {
            if (!this._goals[this._indexFoodAll][1]) {
                if (this._groupFood.length > 0) {
                    checked = false;
                } else {
                    this._goals[this._indexFoodAll][1] = true;
                }
            }
        }

        return checked;
    }
    
    checkPosition(direction): Position {
        let posPlayer = this.positionPlayer();                
        let posNext = new Position (0, 0, false);
        let positions_tmp = Object.assign([], this._groupPosition);
        let range = 5;
        
        if (this._posGoal) {
            positions_tmp.push(this._posGoal);
        }          
        positions_tmp.forEach(p => {
            if (!p.inRange(posPlayer.x, posPlayer.y, range)) {                 
                switch (direction) {
                    case 'D':                                                                      
                        if (p.inRange(posPlayer.x, posPlayer.y, range, 'x') && p.y > posPlayer.y && (!posNext.active || p.y < posNext.y)) {
                            posNext.assign(p);
                        }
                        break;
                    case 'U':                                                
                        if (p.inRange(posPlayer.x, posPlayer.y, range, 'x') && p.y < posPlayer.y && (!posNext.active || p.y > posNext.y)) {
                            posNext.assign(p);
                        }
                        break;
                    case 'R':                             
                        if (p.inRange(posPlayer.x, posPlayer.y, range, 'y') && p.x > posPlayer.x && (!posNext.active || p.x < posNext.x)) {
                            posNext.assign(p);
                        }
                        break;
                    case 'L':                        
                        if (p.inRange(posPlayer.x, posPlayer.y, range, 'y') && p.x < posPlayer.x && (!posNext.active || p.x > posNext.x)) {
                            posNext.assign(p);
                        }
                        break;
                }
            }
        });        

        return posNext;        
    }    
    
    // Funciones auxiliares

    random (min, max) {
        return this._game.rnd.integerInRange(min, max);   
    }

    distance (x1, y1, x2, y2) {
        return  Phaser.Math.distance(x1, x2, y1, y2);   
    }

    changeVolume () {
        this._volume = !this._volume;

        if (!this._volume) {
            this._soundMain.volume = 0;
            this._soundFood.volume = 0;
        } else {
            this._soundMain.volume = 0.3;
            this._soundFood.volume = 0.5;
        }
    }

    stopPlayer() {        
        this._player.body.velocity.x = 0;
        this._player.body.velocity.y = 0; 
        this._player.animations.stop(true);               
    }
        
    /* Acciones jugador */

    // Posición

    positionPlayer(posFixed: boolean = false) {   
        let p = new Position (0, 0);
        let p_x = Math.round(this.player.x) + (this.sizePlayer_x / 2);
        let p_y = Math.round(this.player.y) + (this.sizePlayer_y / 2);  
                
        if (!posFixed) {            
            p.x = p_x;
            p.y = p_y;            
        } else {
            for (let i = 0; i < this._groupPosition.length; i++) {
                if (this._groupPosition[i].inRange(p_x, p_y, 5)) {                    
                    p.assign(this._groupPosition[i]);
                } 
            }           
            if (!p && this._posInitial.inRange(p_x, p_y, 5)) {
                p.assign(this._posInitial);
            }            
        }        
        return p;
    }

    moveDirection(direction: string) {
        
        this._posGoalTmp = this.checkPosition(direction);
        
        if (this._posGoalTmp.active) {
            switch (direction) {
                case 'D':                                    
                    this._player.play('down');
                    break;
                case 'U':                    
                    this._player.play('up');
                    break;
                case 'R':                    
                    this._player.play('right');
                    break;  
                case 'L':                    
                    this._player.play('left');
                    break;
            }  
            this._wait = true;
        } else {            
            let action = '';

            switch (direction) {
                case 'D':                
                    action = 'moveDown()';
                    break;
                case 'U':
                    action = 'moveUp()';
                    break;
                case 'R':
                    action = 'moveRight()';
                    break;  
                case 'L':
                    action = 'moveLeft()';
                    break;
            }
            this.eventGameOver ('No existe posición para ' + action);                    
        }        
    } 

    move (x: number, y: number) {
        if (y < (this._canvasH - (this.sizePlayer_y / 2))) {
            // Animación
            let aux_x = this._player.x - x;
            let aux_y = this._player.y - y;
            if (aux_y > 0 && Math.abs(aux_y) > Math.abs(aux_x)) {
                this._player.play('up');
            } else if (aux_y < 0 && Math.abs(aux_y) > Math.abs(aux_x)) {
                this._player.play('down');
            } else if (aux_x > 0 && Math.abs(aux_x) >= Math.abs(aux_y)) {
                this._player.play('left');
            } else {
                this._player.play('right');
            }
            this._posGoalTmp = new Position (x, y); 
            this._wait = true;            
        } else {
            this.eventGameOver ('Movimiento no válido a (' + x + ',' + y + ')');
        }    
        
    }

    // Alimento

    existsFood() {
        return this._groupFood.length > 0;
    }

    findNearestFood () {
        let _d_min, _d;
        let _id, _type, _x, _y, _food;                

        for (let i = 0; i < this._groupFood.length; i++) {
            _food = this._groupFood.getAt(i);
            _d = Phaser.Math.distance(_food.world.x, _food.world.y, this._player.x, this._player.y);                                      
            if (_d_min === undefined || _d_min > _d) {                
                    _d_min = _d; 
                    _x = _food.world.x + (this.sizeSprite / 2);
                    _y = _food.world.y + (this.sizeSprite / 2);
                    _id = i;
                    _type = _food.key;                                
            }                
        }            
        return new Food (_id, _type, _x, _y);
    }
    
    eat (food: Food, poisonous: boolean = false) {  
        this._wait = true;       
        let dist =  Phaser.Math.distance(food.x, food.y, this._player.x, this._player.y);          
        if (dist < (this.sizePlayer_x)) {
            this._soundFood.play(); 
            let _id = setInterval(
                () => {
                    let aux = this._groupFood.getAt(food.id);
                    aux.kill();                        
                    this._groupFood.remove(aux);                        

                    if (!poisonous) {
                        this._foodCurrent ++;        
                        this._foodText.text = this._foodCurrent;                        
                    } else {
                        this.eventAttacked(this._healthCurrent);
                    }
                    this._wait = false;    
                    clearInterval(_id);                                                                          
                }, 1000);        
        } else {
            this.eventGameOver ('Debe de acercarse al alimento para poder alimentarse');
        } 
    }

    discardFood(food: Food) {              
        let dist =  Phaser.Math.distance(food.x, food.y, this._player.x, this._player.y); 

        if (dist < (this.sizePlayer_x)) {            
            this._wait = true;   
            let _id = setInterval(
                () => {
                    let aux = this._groupFood.getAt(food.id);
                    aux.kill();                        
                    this._groupFood.remove(aux);    
                    this._wait = false;    
                    clearInterval(_id);                                                                                                 
                }, 200);        
        } else {
            this.eventGameOver ('Debe de acercarse al alimento para poder desecharlo');
        }

    }

    
}
