import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';

import { Configure } from '../configure.class';
import { Position } from '../position.class';
import { Food } from '../food.class';

import { GLOBAL } from '../../enum/global.enum';
import { StateEnum } from '../../enum/state.enum';


export class MainState extends Phaser.State {
    
    // Variables principales     
    public configure: Configure;
    public game: Phaser.Game;
    public player: Phaser.Sprite; 
    public map: Phaser.Tilemap;
    public layerBackground: Phaser.TilemapLayer;
    public layerObject: Phaser.TilemapLayer;
    public layerCollision: Phaser.TilemapLayer;
    // Variables sonido
    public soundMain: Phaser.Sound;        
    public soundFood: Phaser.Sound;
    public volumeON: boolean;    
    // Variables para intercambio de información con canvas.class.ts
    private _state: StateEnum;
    public wait: boolean; 
    public messageGO: string;  
    // Variables objetivo    
    public index: number;        
    public posGoal: Position;    
    public indexPos: number;
    public coinGoal: number;
    public indexCoin: number;    
    public foodGoal: number;
    public foodAll: boolean;
    public indexFood: number;
    public indexFoodAll: number;
    // Variables objetivos temporales
    public posGoalTmp: Position;
    // Variables grupos de objetos    
    public groupCoin: Phaser.Group;    
    public groupFood: Phaser.Group;
    // Variables canvas: posición click    
    public clickImage: Phaser.Image;
    public clickText: Phaser.Text;
    // Variables canvas: health
    public healthCurrent: number;
    public healthBar: Phaser.Sprite;        
    // Variables canvas: coin
    public coinCurrent: number;
    public coinText: Phaser.Text;    
    // Variables canvas: food
    public foodCurrent: number;
    public foodText: Phaser.Text;  
    // Variables canvas: tiempo
    public timeCurrent: number;
    public timeText: Phaser.Text;
    public timeEvent: Phaser.Event;
        
    constructor(configure: Configure) {
        super();    

        this.configure = configure;
        this.volumeON = Configure.volumenDefault;
        this.state = StateEnum.UNDEFINED;
        
        this.game = new Phaser.Game(576, 480, Phaser.CANVAS, GLOBAL.CANVAS_ID);
        this.game.state.add(Configure.nameState, this);
        this.game.state.start(Configure.nameState);                                    
    }
    
    set state (s: StateEnum) {

        this._state = s;

        switch (this._state) {
            case StateEnum.READY:                
                this.game.paused = true; 
                this.wait = false;                
                this.messageGO = '';               
                break;
            case StateEnum.RUNNING:
                this.game.paused = false; 
                this.soundMain.play();               
                break;        
            case StateEnum.PAUSED:
                this.game.paused = true;
                break;
            case StateEnum.LEVELUP:                  
                this.game.paused = true; 
                break;
            case StateEnum.GAMEOVER:
                this.soundMain.stop();
                this.game.paused = true;                                   
                break;             
        }        
    }

    get state () {
        return this._state;
    }

    loadResource (name, path) {
        this.game.load.image(name, Configure.path, GLOBAL.PATH_RESOURCE + path);
    }

    loadGroup () {
        return this.game.add.physicsGroup();
    }

    // Funciones básicas Phaser.State

    reload() {
        // Estado del juego
        this.state = StateEnum.READY;

        // Jugador
        this.player.x = this.configure.positionPlayer.x - (this.configure.sizePlayer.width / 2);
        this.player.y = this.configure.positionPlayer.y - (this.configure.sizePlayer.height / 2);
        this.stopPlayer();
        this.game.world.bringToTop(this.player);
        
        // Posiciones
        this.posGoalTmp = null;

        // Evento tiempo
        this.game.time.events.remove(this.timeEvent);       
        this.timeEvent = this.game.time.events.loop(Phaser.Timer.SECOND, this.eventTime, this);

        // Marcar como ningún objetivo conseguido

        // Marcadores
        this.healthCurrent = this.configure.healthMax;
        this.healthBar.width = (this.healthCurrent * Configure.sizeBar.width) / this.configure.healthMax;        
        this.coinCurrent = 0; 
        this.coinText.text = this.coinCurrent;        
        this.foodCurrent = 0; 
        this.foodText.text = this.foodCurrent;
        this.timeCurrent = this.configure.timeMax;
        this.timeText.text = this.timeCurrent;                            
    }

    preload() {
        // Carga map, player y tiledset        
        this.game.load.tilemap('map', Configure.path + GLOBAL.PATH_MAP + this.configure.fileMap, null, Phaser.Tilemap.TILED_JSON);         
        this.game.load.spritesheet('player', Configure.path + GLOBAL.PATH_PLAYER + this.configure.filePlayer, this.configure.sizePlayer.width, this.configure.sizePlayer.height);         
        this.game.load.image('tiledset', Configure.path + GLOBAL.PATH_TILEDSET + this.configure.fileTiledSet);    
        // Carga de audios
        this.game.load.audio('song-main', GLOBAL.PATH_AUDIO + 'song-main.mp3');                
        this.game.load.audio('sound-food', GLOBAL.PATH_AUDIO + 'eating.mp3');
        // Carga burbujas de diálogo
        this.game.load.image('speech_D_C', GLOBAL.PATH_RESOURCE + 'object/speech_down_center.png');
        this.game.load.image('speech_D_L', GLOBAL.PATH_RESOURCE + 'object/speech_down_left.png');
        this.game.load.image('speech_D_R', GLOBAL.PATH_RESOURCE + 'object/speech_down_right.png');
        this.game.load.image('speech_U_C', GLOBAL.PATH_RESOURCE + 'object/speech_up_center.png');
        this.game.load.image('speech_U_L', GLOBAL.PATH_RESOURCE + 'object/speech_up_left.png');
        this.game.load.image('speech_U_R', GLOBAL.PATH_RESOURCE + 'object/speech_up_right.png');
        // Carga elementos barra marcador
        this.game.load.image('health', GLOBAL.PATH_RESOURCE + 'object/health.png');
        this.game.load.image('coin', GLOBAL.PATH_RESOURCE + 'object/coin.png');        
        this.game.load.image('food', GLOBAL.PATH_RESOURCE + 'object/food.png');
        this.game.load.image('time', GLOBAL.PATH_RESOURCE + 'object/time.jpeg');                
        // Carga posicion habilitada
        if (this.configure.positionsChecked ) {
            this.game.load.image('pos', GLOBAL.PATH_RESOURCE + 'object/position.png');
        }            
        // Carga posición objetivo
        if (this.posGoal) {
            this.game.load.image('pos_obj', GLOBAL.PATH_RESOURCE + 'object/positionGoal.png');
        }
    }

    create() {
        // Elementos principales
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = '#FFFFFF';
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('tiledset', 'tiledset');
        this.layerBackground = this.map.createLayer('background');        
        this.layerObject = this.map.createLayer('object');         
        this.layerCollision = this.map.createLayer('collision');         
        this.map.setCollisionBetween(1, 1000, true, this.layerCollision);               

        // Sonido
        this.soundMain = this.game.add.audio('song-main');
        this.soundMain.volume = 0.3;
        this.soundMain.loop = true;   
        this.soundFood = this.game.add.audio('sound-food');        
        this.soundFood.volume = 0.5;

        // Marcador: click posición
        this.game.input.onDown.add(this.eventClick, this);
        this.game.input.onUp.add(
            () => {
                if (this.clickText) {
                    this.clickText.kill();
                }                   
                if (this.clickImage) {
                    this.clickImage.kill();
                }
            },
            this);

        // Marcador: barra de salud 
        this.game.add.image(Configure.positionBar.x, Configure.positionBar.y, 'health');      
        let scoreBoard = this.game.add.graphics();
        scoreBoard.lineStyle(2, 0x000000, 1);
        scoreBoard.drawRect(0, Configure.sizeCanvas.height, Configure.sizeScore.width, Configure.sizeScore.height);
        let healthBoard = this.game.add.graphics();
        healthBoard.lineStyle(2, 0x000000, 1);
        healthBoard.drawRect(100, Configure.sizeCanvas.height + 10, Configure.sizeBar.width + 2, (Configure.sizeBar.height / 2) + 2);                  
        let bmd = this.game.add.bitmapData(Configure.sizeBar.width, Configure.sizeBar.height / 2);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, Configure.sizeBar.width, Configure.sizeBar.height);
        bmd.ctx.fillStyle = '#21610B';
        bmd.ctx.fill();
        this.healthBar = this.game.add.sprite(101, Configure.sizeCanvas.height + 11, bmd);    
        
        // Marcador: coin
        this.game.add.image(this.game.width / 1.4, Configure.sizeCanvas.height + 2, 'coin');
        this.coinText = this.game.add.text(this.game.width / 1.28, Configure.sizeCanvas.height + 2, '', Configure.styleScore);
        // Marcador: food
        this.game.add.image(this.game.width / 1.17, Configure.sizeCanvas.height + 2, 'food');
        this.foodText = this.game.add.text(this.game.width / 1.1, Configure.sizeCanvas.height + 2, '', Configure.styleScore);  
        // Marcador: time
        this.game.add.image(this.game.width / 1.16, Configure.sizeCanvas.height + 30, 'time');
        this.timeText = this.game.add.text(this.game.width / 1.1, Configure.sizeCanvas.height + 30, '', Configure.styleScore); 

        // Posiciones habilitadas
        if (this.configure.positionsChecked) {
            this.configure.positionsChecked.forEach( (p) => {
                let s = this.game.add.sprite(p.x - (Configure.sizeSprite.width / 2), p.y - (Configure.sizeSprite.height / 2), 'pos');
                s.width = Configure.sizeSprite.width ;
                s.height = Configure.sizeSprite.height;
            });
        }
                
        // Posición objetivo
        if (this.posGoal) {
            let s = this.game.add.sprite(this.posGoal.x - (Configure.sizeSprite.width / 2), this.posGoal.y - (Configure.sizeSprite.height / 2), 'pos_obj');
            s.width = Configure.sizeSprite.width ;
            s.height = Configure.sizeSprite.height ;
        }   
        
        // Player
        this.player = this.game.add.sprite(this.configure.positionPlayer.x - (this.configure.sizePlayer.width / 2), this.configure.positionPlayer.y - (this.configure.sizePlayer.height / 2), 'player', 0);           
        this.player.animations.add('right', [0, 1, 2, 3], 10, true);
        this.player.animations.add('up', [4, 5, 6, 7], 10, true);
        this.player.animations.add('left', [8, 9, 10, 11], 10, true);
        this.player.animations.add('down', [12, 13, 14, 15], 10, true);        
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.body.onWorldBounds = new Phaser.Signal();
        this.player.body.onWorldBounds.add(this.eventCollisionBlock, this); 
        
        this.state = StateEnum.READY;        
    }

    update() {

        // Comprobar colisión con pared
        this.game.physics.arcade.collide(this.layerCollision, this.player, this.eventCollisionBlock, null, this);

        // Comprobar objetivo temporal
        if (this.posGoalTmp) {
            let dist = this.game.physics.arcade.distanceToXY(this.player, this.posGoalTmp.x - (this.configure.sizePlayer.width / 2) , this.posGoalTmp.y - (this.configure.sizePlayer.height / 2));

            if (Math.round(dist) >= -1 && Math.round(dist) <= 1) {
                this.stopPlayer();                             
                delete this.posGoalTmp;
                this.wait = false;  
            } else {
                this.game.physics.arcade.moveToXY(this.player, this.posGoalTmp.x - (this.configure.sizePlayer.width / 2) , this.posGoalTmp.y - (this.configure.sizePlayer.height / 2), Configure.velocity);
            }

        }  

        // Comprobar objetivos finales
        /*if (this.checkGoals()) {
            this.stateGame = StateEnum.LEVELUP;   
        }*/       
    }

    // Eventos

    eventClick() {
        let posX = parseInt(this.game.input.mousePointer.x, 10);
        let posY = parseInt(this.game.input.mousePointer.y, 10);    
        
        if (posY > Configure.sizeCanvas.height) {
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

        
        this.clickImage = this.game.add.sprite(posSpeech.x, posSpeech.y , image);
        this.clickText = this.game.add.text(posText.x, posText.y, messagge, Configure.stylePositionClick);
    }

    eventTime() {
        this.timeCurrent --;
        this.timeText.text = this.timeCurrent;
        if (this.timeCurrent <= 0) {
            this.eventGameOver('Fin del tiempo');                         
        }
    }

    eventCollisionBlock() {
        this.eventGameOver('Colisión');        
    }

    eventAttacked (hurt: number) {
        this.healthCurrent -= hurt;        
        if (this.healthCurrent <= 0) {
            this.healthCurrent = 0;
            this.eventGameOver('El organismo ha muerto');
        }
        this.healthBar.width = (this.healthCurrent * Configure.sizeBar.width) / this.configure.healthMax;
    }

    eventGameOver (msg: string) {
        this.game.time.events.remove(this.timeEvent);         
        this.messageGO = msg;
        this.state = StateEnum.GAMEOVER;                  
    }

    // Checked

    /*checkGoals() {
        let checked = true;

        // Posición objetivo
        if (this.posGoal) {
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
    }*/
    
    checkPosition(direction): Position {
        let posPlayer = this.positionPlayer();                
        let posNext = new Position (0, 0, false);
        let positions_tmp = Object.assign([], this.configure.positionsChecked);
        let range = 5;
        
        if (this.posGoal) {
            positions_tmp.push(this.posGoal);
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
        return this.game.rnd.integerInRange(min, max);   
    }

    distance (x1, y1, x2, y2) {
        return  Phaser.Math.distance(x1, x2, y1, y2);   
    }

    changeVolume () {
        this.volumeON = !this.volumeON;

        if (!this.volumeON) {
            this.soundMain.volume = 0;
            this.soundFood.volume = 0;
        } else {
            this.soundMain.volume = 0.3;
            this.soundFood.volume = 0.5;
        }
    }

    stopPlayer() {
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0; 
        this.player.animations.stop(true);               
    }
        
    /* Acciones jugador */

    // Posición

    positionPlayer(posFixed: boolean = false) {   
        let p = new Position (0, 0);
        let p_x = Math.round(this.player.x) + (this.configure.sizePlayer.width / 2);
        let p_y = Math.round(this.player.y) + (this.configure.sizePlayer.height / 2);  
                
        if (!posFixed) {            
            p.x = p_x;
            p.y = p_y;            
        } else {
            for (let i = 0; i < this.configure.positionsChecked.length; i++) {
                if (this.configure.positionsChecked[i].inRange(p_x, p_y, 5)) {                    
                    p.assign(this.configure.positionsChecked[i]);
                } 
            }           
            if (!p && this.configure.positionPlayer.inRange(p_x, p_y, 5)) {
                p.assign(this.configure.positionPlayer);
            }            
        }        
        return p;
    }

    moveDirection(direction: string) {
        
        this.posGoalTmp = this.checkPosition(direction);
        
        if (this.posGoalTmp.active) {
            switch (direction) {
                case 'D':                                    
                    this.player.play('down');
                    break;
                case 'U':                    
                    this.player.play('up');
                    break;
                case 'R':                    
                    this.player.play('right');
                    break;  
                case 'L':                    
                    this.player.play('left');
                    break;
            }  
            this.wait = true;
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
        if (y < (Configure.sizeCanvas.height - (this.configure.sizePlayer.height / 2))) {
            // Animación
            let aux_x = this.player.x - x;
            let aux_y = this.player.y - y;
            if (aux_y > 0 && Math.abs(aux_y) > Math.abs(aux_x)) {
                this.player.play('up');
            } else if (aux_y < 0 && Math.abs(aux_y) > Math.abs(aux_x)) {
                this.player.play('down');
            } else if (aux_x > 0 && Math.abs(aux_x) >= Math.abs(aux_y)) {
                this.player.play('left');
            } else {
                this.player.play('right');
            }
            this.posGoalTmp = new Position (x, y); 
            this.wait = true;            
        } else {
            this.eventGameOver ('Movimiento no válido a (' + x + ',' + y + ')');
        }    
        
    }

    // Alimento

    existsFood() {
        return this.groupFood.length > 0;
    }

    findNearestFood () {
        let _d_min, _d;
        let _id, _type, _x, _y, _food;                

        for (let i = 0; i < this.groupFood.length; i++) {
            _food = this.groupFood.getAt(i);
            _d = Phaser.Math.distance(_food.world.x, _food.world.y, this.player.x, this.player.y);                                      
            if (_d_min === undefined || _d_min > _d) {                
                    _d_min = _d; 
                    _x = _food.world.x + (Configure.sizeSprite.width / 2);
                    _y = _food.world.y + (Configure.sizeSprite.height / 2);
                    _id = i;
                    _type = _food.key;                                
            }                
        }            
        return new Food (_id, _type, _x, _y);
    }
    
    eat (food: Food, poisonous: boolean = false) {  
        this.wait = true;       
        let dist =  Phaser.Math.distance(food.x, food.y, this.player.x, this.player.y);          
        if (dist < (this.configure.sizePlayer.width)) {
            this.soundFood.play(); 
            let _id = setInterval(
                () => {
                    let aux = this.groupFood.getAt(food.id);
                    aux.kill();                        
                    this.groupFood.remove(aux);                        

                    if (!poisonous) {
                        this.foodCurrent ++;        
                        this.foodText.text = this.foodCurrent;                        
                    } else {
                        this.eventAttacked(this.healthCurrent);
                    }
                    this.wait = false;    
                    clearInterval(_id);                                                                          
                }, 1000);        
        } else {
            this.eventGameOver ('Debe de acercarse al alimento para poder alimentarse');
        } 
    }

    discardFood(food: Food) {              
        let dist =  Phaser.Math.distance(food.x, food.y, this.player.x, this.player.y); 

        if (dist < (this.configure.sizePlayer.width)) {            
            this.wait = true;   
            let _id = setInterval(
                () => {
                    let aux = this.groupFood.getAt(food.id);
                    aux.kill();                        
                    this.groupFood.remove(aux);    
                    this.wait = false;    
                    clearInterval(_id);                                                                                                 
                }, 200);        
        } else {
            this.eventGameOver ('Debe de acercarse al alimento para poder desecharlo');
        }

    }

    
}
