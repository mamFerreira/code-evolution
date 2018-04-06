import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';

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


export enum TypeGoal {
    Position
}

export class StateMain extends Phaser.State {
    
    // Variables principales
    public game: Phaser.Game;  
    private map: Phaser.Tilemap;
    private layer_surface: Phaser.TilemapLayer;
    private layer_block: Phaser.TilemapLayer;          
    private player;   
    private size_player: number;
    private sound;

    // Variables de configuración
    private velocity;
    private healthBarWidth;
    public filePlayer: string;
    public fileMap: string;
    public fileTiledset: string;
    private urlResource: string;
    private urlAudio: string;
    private urlApi: String;      

    // Variables para intercambio de información
    private _stateGame: GameState;
    public waitMove: boolean;
    public response: string; 
    public code_error: string; 
    
    // Variables para mostrar posición 
    private clickPositionText;
    private clickPositionImage;

    // Variables de posición
    private posInitial: Position;
    private posGoalTmp: Position;
    private posGoal: Position;
    private positions: Position[];

    // Variables objetivo
    private coinGoal: number;
    private coinCurrent: number;
    private coinText;

    private foodGoal: number;
    private foodCurrent: number;
    private foodCanvas: number;
    private foodText;    

    private enemyGoal: number;
    private enemyCurrent: number;
    private enemyText;

    // Variables de tiempo
    public timeMax: number;    
    private timeCurrent: number;
    private timerGameOver;
    private timerText;

    // Variables de vida
    public lifeMax: number;
    private lifeCurrent: number;
    private healthBar;

    // Variables objetos
    private groupFood;
           
    
    constructor(id) {
        super();        
        this.urlApi = Global.url_api;         
        this.urlResource = '../../assets/resource/';
        this.urlAudio = '../../assets/audio/';
        this.game = new Phaser.Game(515, 444, Phaser.CANVAS, id); 
        this.velocity = 64;
        this.healthBarWidth = 250; 
        this.size_player = 38; 
        this.positions = new Array<Position>();
        this.posGoal = new Position(0, 0, false);
        this.foodGoal = null;
        this.enemyGoal = null;
    }

    reload() {
        // Estado del juego
        this.stateGame = GameState.Init;

        // Jugador
        this.player.x = this.posInitial.x;
        this.player.y = this.posInitial.y;
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        
        // Posiciones
        this.posGoalTmp = new Position(0, 0, false);         

        // Marcadores
        this.lifeCurrent = this.lifeMax;        
        this.coinCurrent = 0; 
        this.coinText.text = this.coinCurrent;
        this.enemyCurrent = 0;
        this.enemyText.text = this.enemyCurrent;
        this.foodCurrent = 0; 
        this.foodCanvas = 0;
        this.foodText.text = this.foodCurrent;
        this.timeCurrent = this.timeMax;
        this.timerText.text = this.timeCurrent;    
        
        
        // Eliminar assets
        this.groupFood.removeAll();


        // Evento tiempo
        if (this.timerGameOver) {
            this.game.time.events.remove(this.timerGameOver);  
        }        
        this.timerGameOver = this.game.time.events.loop(Phaser.Timer.SECOND, this.eventTime, this);
    }

    preload() {                        
        // Carga map, player y tiledset        
        this.game.load.tilemap('map', this.urlApi + 'level-load/' + this.fileMap + '/M', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('player', this.urlApi + 'evolution-load/' + this.filePlayer + '/P');        
        this.game.load.image('tiledset', this.urlApi + 'evolution-load/' + this.fileTiledset + '/T');    
        // Carga de audios
        this.game.load.audio('song1', this.urlAudio + 'song1.mp3');
        // Carga elementos barra marcador
        this.game.load.image('health', this.urlResource + 'object/health.png');
        this.game.load.image('coin', this.urlResource + 'object/coin.png');
        this.game.load.image('enemy', this.urlResource + 'object/death.png');
        this.game.load.image('food', this.urlResource + 'object/food.png');
        this.game.load.image('time', this.urlResource + 'object/time.jpeg');
        // Carga burbujas de diálogo
        this.game.load.image('speech_D_C', this.urlResource + 'object/speech_down_center.png');
        this.game.load.image('speech_D_L', this.urlResource + 'object/speech_down_left.png');
        this.game.load.image('speech_D_R', this.urlResource + 'object/speech_down_right.png');
        this.game.load.image('speech_U_C', this.urlResource + 'object/speech_up_center.png');
        this.game.load.image('speech_U_L', this.urlResource + 'object/speech_up_left.png');
        this.game.load.image('speech_U_R', this.urlResource + 'object/speech_up_right.png');
        // Carga posición objetivo
        if (this.posGoal) {
            this.game.load.image('pos_obj', this.urlResource + 'object/positionGoal.png');
        }
        // Carga posicion habilitada
        if (this.positions.length > 0 ) {
            this.game.load.image('pos', this.urlResource + 'object/position.png');
        }
        
        this.game.load.image('food_1', this.urlResource + 'food/food_2.png');
    }
    
    create() {
        // Elementos principales
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = '#FFFFFF';
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('tiledset', 'tiledset');
        this.layer_surface = this.map.createLayer('surface');
        this.layer_block = this.map.createLayer('block'); 
        this.map.setCollisionBetween(1, 3500, true, this.layer_block);

        // Sonidos
        this.sound = this.game.add.audio('song1');

        // Marcador
        let scoreBoard = this.game.add.graphics();
        scoreBoard.lineStyle(2, 0x000000, 1);
        scoreBoard.drawRect(0, 383, 515, 64);
        let healthBoard = this.game.add.graphics();
        healthBoard.lineStyle(2, 0x000000, 1);
        healthBoard.drawRect(100, 396, this.healthBarWidth + 2, 34);
        this.game.add.image(36, 398, 'health');      
        
        this.game.add.image(this.game.width / 1.4, 385, 'coin');
        this.coinText = this.game.add.text(this.game.width / 1.28, 385, '', styleScore);
        this.game.add.image(this.game.width / 1.4, 413, 'enemy');
        this.enemyText = this.game.add.text(this.game.width / 1.28, 413, '', styleScore); 
        this.game.add.image(this.game.width / 1.17, 385, 'food');
        this.foodText = this.game.add.text(this.game.width / 1.1, 385, '', styleScore);  
        this.game.add.image(this.game.width / 1.16, 413, 'time');
        this.timerText = this.game.add.text(this.game.width / 1.1, 413, '', styleScore); 

        
        // Posición objetivo
        if (this.posGoal.active) {
            this.game.add.sprite(this.posGoal.x, this.posGoal.y, 'pos_obj');
        }
        // Posiciones habilitadas
        this.positions.forEach( (p) => {
            this.game.add.sprite(p.x, p.y, 'pos');
        });

        // Player
        this.player = this.game.add.sprite(this.posInitial.x, this.posInitial.y, 'player');
        this.player.width = this.size_player;
        this.player.height = this.size_player;
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.body.onWorldBounds = new Phaser.Signal();
        this.player.body.onWorldBounds.add(this.eventCollisionBlock, this);

        // Mostrar posición click
        this.game.input.onDown.add(this.drawSpeechClick, this);
        this.game.input.onUp.add(
            () => {
                if (this.clickPositionText) {
                    this.clickPositionText.kill();
                }   
                
                if (this.clickPositionImage) {
                    this.clickPositionImage.kill();
                }
            },
        this);
        
              

        // Barra de vida        
        let bmd = this.game.add.bitmapData(this.healthBarWidth, 32);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, this.healthBarWidth, 32);
        bmd.ctx.fillStyle = '#21610B';
        bmd.ctx.fill();
        this.healthBar = this.game.add.sprite(101, 397, bmd);                       

        // Dibujar objetos aleatorios             
        this.groupFood = this.game.add.physicsGroup();        


        // Pausar juego
        this.reload();  
    }

    drawSpeechClick() {
        let posX = parseInt(this.game.input.mousePointer.x, 10);
        let posY = parseInt(this.game.input.mousePointer.y, 10);    
        
        if (posY > 380) {
            return;
        }
        let messagge = 'x = ' + posX + '\ny = ' + posY;
        // Arriba centro por defecto
        let posText = new Position (posX - 15, posY - 50, true);
        let posSpeech = new Position (posX - 45, posY - 60, true);
        let image = 'speech_U_C';              
        
        // Abajo centro
        if (posY < 60 && posX > 40 && posX  < (this.game.width - 40)) {                    
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
        if (posY < 60 && posX  >= (this.game.width - 40)) {
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
        if (posY >= 60 && posX  >= (this.game.width - 40)) {
            posText.x = posX - 50;
            posSpeech.x = posX - 85;                    
            image = 'speech_U_L';
        }

        
        this.clickPositionImage = this.game.add.sprite(posSpeech.x, posSpeech.y , image);
        this.clickPositionText = this.game.add.text(posText.x, posText.y, messagge, stylePositionClick);
    }

    eventTime() {
        this.timeCurrent --;
        this.timerText.text = this.timeCurrent;
        if (this.timeCurrent <= 0) {
            this.game.time.events.remove(this.timerGameOver);                
            this.stateGame = GameState.GameOver;                           
        }
    }

    eventCollisionBlock() {
        this.stateGame = GameState.GameOver;
        this.code_error = 'Colisión';
    }

    eventCollisionFood(player, food) {
        food.kill();
        this.groupFood.remove(food);
        this.foodCanvas --;
        this.foodCurrent ++;        
        this.foodText.text = this.foodCurrent;
    }

    update() {                
        /*if (this.lifeCurrent > 0) {
            this.lifeCurrent -= 1;            
            this.healthBar.width = (this.lifeCurrent * this.healthBarWidth) / this.lifeMax;                      
        }*/ 
        if (this.foodCanvas === 0 && this.posInitial.inRange(this.player.x, this.player.y, 2)) {
            let number = this.game.rnd.between(1, this.positions.length - 1);   
            this.groupFood.create(this.positions[number].x, this.positions[number].y, 'food_1');
            this.foodCanvas ++;
        }        

        this.game.physics.arcade.collide(this.player, this.groupFood, this.eventCollisionFood, null, this);
        
        this.game.physics.arcade.collide(this.layer_block, this.player, this.eventCollisionBlock, null, this);


        // Comprobar objetivos temporales
        if (this.posGoalTmp.active && 
            this.posGoalTmp.inRange(this.player.x, this.player.y, 2)) {             
            this.stopPlayer();
            this.waitMove = false; 
                   
        }  

        // Comprobar objetivos finales
        if (this.checkGoals()) {
            this.stateGame = GameState.LevelUp;   
        }        
    }

    checkGoals() {
        let checked = true;

        // Posición objetivo
        if (this.posGoal.active) {
            if (!this.posGoal.inRange(this.player.x, this.player.y, 2)) {
                checked = false;
            }
        }

        // Alimentos recorridos
        if (this.foodGoal && checked) {
            if (this.foodGoal > this.foodCurrent) {
                checked = false;
            }
        }

        return checked;
    }

    addGoal(key, v1, v2) {

        switch (key) {
            case 'POSITION':
                this.posGoal = new Position(v1 - (this.size_player / 2), v2 - (this.size_player / 2));
                break;
            case 'FOOD':
                this.foodGoal = v1;
        }
        
    }

    addPosition (x, y, init = false) {
        if (init) {
            this.posInitial = new Position(x - (this.size_player / 2), y - (this.size_player / 2));
        } else {
            let p = new Position(x - (this.size_player / 2), y - (this.size_player / 2));            
            this.positions.push(p);
        }
    }

    nextPosition(direction): Position {        
        let posPlayer = new Position (this.player.x, this.player.y);                
        let posNext = new Position (0, 0, false);     
        let positions_tmp = Object.assign([], this.positions);
        let range = 2;
        
        positions_tmp.push(this.posGoal);
        positions_tmp.forEach(p => {
            if (!posPlayer.inRange(p.x, p.y, range)) {                 
                switch (direction) {
                    case 'D':                                                                      
                        if (posPlayer.inRange(p.x, p.y, range, 'x') && p.y > posPlayer.y && (!posNext.active || p.y < posNext.y)) {
                            posNext.assign(p);
                        }
                        break;
                    case 'U':                                                
                        if (posPlayer.inRange(p.x, p.y, range, 'x') && p.y < posPlayer.y && (!posNext.active || p.y > posNext.y)) {
                            posNext.assign(p);
                        }
                        break;
                    case 'R':                             
                        if (posPlayer.inRange(p.x, p.y, range, 'y') && p.x > posPlayer.x && (!posNext.active || p.x < posNext.x)) {
                            posNext.assign(p);
                        }
                        break;
                    case 'L':                        
                        if (posPlayer.inRange(p.x, p.y, range, 'y') && p.x < posPlayer.x && (!posNext.active || p.x > posNext.x)) {
                            posNext.assign(p);
                        }
                        break;
                }
            }
        });


        return posNext;        
    }

    stopPlayer() {
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;                
        this.posGoalTmp.active = false;
    }

    set stateGame (s: GameState) {
        
        this._stateGame = s; 
        
        switch (s) {
            case GameState.Init:                
                this.game.paused = true; 
                this.waitMove = false;
                this.response = null;
                this.code_error = null;               
                break;
            case GameState.Run:
                this.game.paused = false; 
                // this.sound.play();               
                break;        
            case GameState.Pause:
                this.game.paused = true;
                break;
            case GameState.LevelUp:
                this.game.paused = true;
                break;
            case GameState.GameOver:
                this.game.paused = true;   
                break;             
        }        
    }

    get stateGame () {
        return this._stateGame;
    }


    /* Métodos ejecutables por el jugador */
    moveDirection(direction: string) {        
        
        this.posGoalTmp = this.nextPosition(direction);

        if (this.posGoalTmp.active) {
            switch (direction) {
                case 'D':                
                    this.player.body.velocity.y = this.velocity;                                
                    break;
                case 'U':
                    this.player.body.velocity.y = -this.velocity;                                    
                    break;
                case 'R':
                    this.player.body.velocity.x = this.velocity;                                    
                    break;  
                case 'L':
                    this.player.body.velocity.x = -this.velocity;                                    
                    break;
            }  
            this.waitMove = true;
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
            this.stateGame = GameState.GameOver;             
            this.code_error = 'No existe posición para ' + action;
        }        
    } 

    move (x: number, y: number) {        
        this.posGoalTmp = new Position (x - (this.size_player / 2), y - (this.size_player / 2)); 
        this.waitMove = true;                              
        this.game.physics.arcade.moveToXY(this.player, this.posGoalTmp.x, this.posGoalTmp.y, this.velocity);
    }

    findNearestFood () {

        let p = null;
        let d_min = null, d;        
        this.groupFood.forEach(element => {            
            d = Phaser.Math.distance(element.world.x, element.world.y, this.player.x, this.player.y).toFixed(2);            
            if (!d_min || d_min > d) {
                d_min = d;
                p = new Position(element.world.x, element.world.y);
                p.x = element.world.x;
                p.y = element.world.y;
            }                      
        });        

        return p;
    }

}

export class Position {
    private _x: number;
    private _y: number;
    private _active: boolean;    

    constructor(x, y, active = true) {
        this._x = x;
        this._y = y;        
        this._active = active;
    }

    get x(): number {
        return this._x;
    }
    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }
    set y(value: number) {
        this._y = value;
    }

    get active(): boolean {
        return this._active;
    }
    set active(value: boolean) {
        this._active = value;
    }

    inRange (x: number, y: number, range: number, coord: string = 'xy'): boolean {

        let result = true;

        switch (coord) {
            case 'x':            
                if ( x >= this._x + range || x <= this._x - range) {
                    result = false;
                }
                break;
            case 'y':            
                if ( y >= this._y + range || y <= this._y - range) {
                    result = false;
                }
                break;                
            case 'xy':
                if ( x >= this._x + range || x <= this._x - range || y >= this._y + range || y <= this._y - range) {
                    result = false;
                }
                break;
            default:
                result = false;
        }
        return result;        
    }

    assign(p: Position) {
        this._x = p.x;
        this._y = p.y;
        this._active = p.active;
    }
}

