import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';

import { Configure } from '../configure.class';
import { Position } from '../position.class';
import { Food } from '../food.class';
import { Objecto } from '../object.class';
import { GLOBAL } from '../../enum/global.enum';
import { StateEnum } from '../../enum/state.enum';
import { GoalEnum } from '../../enum/goal.enum';
// import { ConsoleReporter } from 'jasmine';


export class MainState extends Phaser.State {
    
    // Variables principales  
    private _state: StateEnum;   
    public configure: Configure;
    public game: Phaser.Game;
    public player: Phaser.Sprite; 
    public map: Phaser.Tilemap;
    public layerBackground: Phaser.TilemapLayer;
    public layerObject: Phaser.TilemapLayer;
    public layerCollision: Phaser.TilemapLayer;
    public groupFood: Phaser.Group;
    public groupObject: Phaser.Group;        
    public groupBaby: Phaser.Group;
    // Variables sonido
    public soundMain: Phaser.Sound;        
    public soundFood: Phaser.Sound;
    public volumeON: boolean;    
    // Variables para intercambio de información con canvas.class.ts    
    public wait: boolean; 
    public messageGO: string;      
    // Variables objetivos temporales
    public goalTemp: Position;
    // Variables canvas    
    public clickImage: Phaser.Image;
    public clickText: Phaser.Text;    
    public healthCurrent: number;
    public healthBar: Phaser.Sprite;            
    public coinText: Phaser.Text;        
    public foodText: Phaser.Text;      
    public babyText: Phaser.Text;      
    public timeCurrent: number;
    public timeText: Phaser.Text;
    public timeEvent: Phaser.Event;
    public foodBag: Food;
        
    constructor(configure: Configure) {
        super();
        this.configure = configure;
        this.volumeON = Configure.volumenDefault;
        this.state = StateEnum.UNDEFINED;                                
        this.game = new Phaser.Game(576, 480, Phaser.CANVAS, GLOBAL.CANVAS_ID);        
        this.game.state.add(Configure.nameState, this);
        this.game.state.start(Configure.nameState);   
        this.healthCurrent = this.configure.healthMax;    
        this.foodBag = null;       
    }
    
    set state (s: StateEnum) {
        
        switch (s) {
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
        
        this._state = s;
    }

    get state (): StateEnum {
        return this._state;
    }

    get position (): Position {         
        
        let p_x = Math.round(this.player.x) + (this.configure.sizePlayer.width / 2);
        let p_y = Math.round(this.player.y) + (this.configure.sizePlayer.height / 2);  
        let p = new Position (p_x, p_y);

        for (let i = 0; i < this.configure.positionsChecked.length; i++) {
            if (this.configure.positionsChecked[i].inRange(p_x, p_y)) {                    
                p.assign(this.configure.positionsChecked[i]);
            } 
        }    
        return p;       
    }    

    //#region MÉTODOS PHASER

    reload() {
        // Estado del juego        
        this.state = StateEnum.READY;

        // Jugador
        this.player.x = this.configure.positionInit.x - (this.configure.sizePlayer.width / 2);
        this.player.y = this.configure.positionInit.y - (this.configure.sizePlayer.height / 2);
        this.stopPlayer();
        this.game.world.bringToTop(this.player);
        
        // Posiciones
        this.goalTemp = null;

        // Evento tiempo
        this.game.time.events.remove(this.timeEvent);       
        this.timeEvent = this.game.time.events.loop(Phaser.Timer.SECOND, this.eventTime, this);

        // Reiniciar objetivos
        this.configure.goals.forEach(element => {
            element.overcome = -1;
            element.current = 0;
        });

        // Marcadores
        this.healthCurrent = this.configure.healthMax;
        this.healthBar.width = (this.healthCurrent * Configure.sizeBar.width) / this.configure.healthMax;                
        this.coinText.text = 0;       
        this.foodText.text = 0;
        this.babyText.text = 0;
        this.timeCurrent = this.configure.timeMax;
        this.timeText.text = this.timeCurrent;
        this.foodBag = null;
        
        // Reiniciar los grupos
        this.groupFood.removeBetween(0);        
        this.groupObject.removeBetween(0); 
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
        this.game.load.image('baby', GLOBAL.PATH_RESOURCE + 'object/baby.png');
        this.game.load.image('time', GLOBAL.PATH_RESOURCE + 'object/time.jpeg');                
        // Carga posicion habilitada
        if (this.configure.positionsChecked ) {
            this.game.load.image('pos', GLOBAL.PATH_RESOURCE + 'object/position.png');
        }            
        // Carga posición objetivo
        if (this.configure.goals[GoalEnum.POSITION].active) {
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
        healthBoard.drawRect(80, Configure.sizeCanvas.height + 20, Configure.sizeBar.width + 2, Configure.sizeBar.height + 2);                  
        let bmd = this.game.add.bitmapData(Configure.sizeBar.width, Configure.sizeBar.height);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, Configure.sizeBar.width, Configure.sizeBar.height);
        bmd.ctx.fillStyle = '#21610B';
        bmd.ctx.fill();
        this.healthBar = this.game.add.sprite(81, Configure.sizeCanvas.height + 21, bmd);    
        
        // Marcador: coin
        this.game.add.image(Configure.sizeCanvas.width * 0.7, Configure.sizeCanvas.height + 5, 'coin');
        this.coinText = this.game.add.text((Configure.sizeCanvas.width * 0.7) + Configure.sizeSprite.width, Configure.sizeCanvas.height + 5, '', Configure.styleScore);
        this.coinText.text = this.configure.goals[GoalEnum.OBJECT].current.toString();
        // Marcador: food
        this.game.add.image(Configure.sizeCanvas.width * 0.85, Configure.sizeCanvas.height + 5, 'food');
        this.foodText = this.game.add.text((Configure.sizeCanvas.width * 0.85) + Configure.sizeSprite.width, Configure.sizeCanvas.height + 5, '', Configure.styleScore);  
        this.foodText.text = this.configure.goals[GoalEnum.FOOD].current.toString();
        // Marcador: baby
        this.game.add.image(Configure.sizeCanvas.width * 0.7, Configure.sizeCanvas.height + 35, 'baby');
        this.babyText = this.game.add.text((Configure.sizeCanvas.width * 0.7) + Configure.sizeSprite.width, Configure.sizeCanvas.height + 35, '', Configure.styleScore); 
        this.babyText.text = this.configure.goals[GoalEnum.BABY].current.toString();
        // Marcador: time
        this.game.add.image(Configure.sizeCanvas.width * 0.86, Configure.sizeCanvas.height + 35, 'time');
        this.timeText = this.game.add.text((Configure.sizeCanvas.width * 0.86) + Configure.sizeSprite.width, Configure.sizeCanvas.height + 35, '', Configure.styleScore); 
        this.timeText.text = this.configure.timeMax;

        // Posiciones habilitadas
        if (this.configure.positionsChecked) {
            this.configure.positionsChecked.forEach( (p) => {
                let s = this.game.add.sprite(p.x - (Configure.sizeSprite.width / 2), p.y - (Configure.sizeSprite.height / 2), 'pos');
                s.width = Configure.sizeSprite.width ;
                s.height = Configure.sizeSprite.height;
            });
        }
                
        // Posición objetivo
        if (this.configure.goals[GoalEnum.POSITION].active) {
            let s = this.game.add.sprite(+this.configure.goals[GoalEnum.POSITION].value_1 - (Configure.sizeSprite.width / 2), this.configure.goals[GoalEnum.POSITION].value_2 - (Configure.sizeSprite.height / 2), 'pos_obj');
            s.width = Configure.sizeSprite.width ;
            s.height = Configure.sizeSprite.height ;
        }   
        
        // Player
        this.player = this.game.add.sprite(this.configure.positionInit.x - (this.configure.sizePlayer.width / 2), this.configure.positionInit.y - (this.configure.sizePlayer.height / 2), 'player', 0);           
        this.player.animations.add('right', [0, 1, 2, 3], 10, true);
        this.player.animations.add('up', [4, 5, 6, 7], 10, true);
        this.player.animations.add('left', [8, 9, 10, 11], 10, true);
        this.player.animations.add('down', [12, 13, 14, 15], 10, true);        
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);
        this.player.body.collideWorldBounds = true;
        this.player.body.onWorldBounds = new Phaser.Signal();
        this.player.body.onWorldBounds.add(this.eventCollisionBlock, this); 
        
        // Iniciamos los grupos
        this.groupFood = this.game.add.physicsGroup();
        this.groupObject = this.game.add.physicsGroup();        

        this.state = StateEnum.READY;        
    }

    update() {        
        // Comprobar colisión con pared
        this.game.physics.arcade.collide(this.layerCollision, this.player, this.eventCollisionBlock, null, this);

        // Comprobar objetivo temporal
        if (this.goalTemp) {
            let dist = this.game.physics.arcade.distanceToXY(this.player, this.goalTemp.x - (this.configure.sizePlayer.width / 2) , this.goalTemp.y - (this.configure.sizePlayer.height / 2));

            if (Math.round(dist) >= -1 && Math.round(dist) <= 1) {
                this.stopPlayer();                             
                delete this.goalTemp;
                this.wait = false;  
            } else {
                this.game.physics.arcade.moveToXY(this.player, this.goalTemp.x - (this.configure.sizePlayer.width / 2) , this.goalTemp.y - (this.configure.sizePlayer.height / 2), Configure.velocity);
            }
        }  

        // Comprobar objetivos finales
        this.checkGoals();        
    }    
    
    //#endregion
        
    //#region ACCIONES JUGADOR

    moveDirection(direction: string) {
        
        this.goalTemp = this.checkPosition(direction);        
        if (this.goalTemp.active) {
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
            this.goalTemp = new Position (x, y);                         
        } else {
            this.eventGameOver ('Movimiento no válido a (' + x + ',' + y + ')');
        }    
        
    }    

    findNearestFood () {
        let pos = this.position;
        let dist_m;
        let result = null;

        for (let i = 0; i < this.groupFood.length; i++) {
            let food = this.groupFood.getAt(i);
            let dist = Phaser.Math.distance(food.world.x, food.world.y, pos.x, pos.y);                                      
            if (dist_m === undefined || dist_m > dist) {                
                dist_m = dist; 
                result = new Food(i, '', food.world.x + (Configure.sizeSprite.width / 2), food.world.y + (Configure.sizeSprite.height / 2));                
            }                
        }       

        return result;
    }

    findNearestObject () {
        let pos = this.position;
        let dist_m;
        let result = null;

        for (let i = 0; i < this.groupObject.length; i++) {
            let object = this.groupObject.getAt(i);
            let dist = Phaser.Math.distance(object.world.x, object.world.y, pos.x, pos.y);                                      
            if (dist_m === undefined || dist_m > dist) {                
                dist_m = dist; 
                let trap = object.key === 'object_bomb' ? true : false;
                result = new Objecto(i, trap, object.world.x + (Configure.sizeSprite.width / 2), object.world.y + (Configure.sizeSprite.height / 2));                
            }                
        }               

        return result;
    }
    
    eat () {
        let index = -1;
        let positionPlayer = this.position;        
        for (let i = 0; i < this.groupFood.length; i++) {
            let food = this.groupFood.getAt(i);  

            if (positionPlayer.inRange(food.world.x + Configure.sizeSprite.width / 2, food.world.y + Configure.sizeSprite.height / 2)) {                
                index = i;
                this.soundFood.play(); 
                let _id = setInterval(
                () => {                    
                    food.kill();                        
                    this.groupFood.remove(food);                                        
                    this.configure.goals[GoalEnum.FOOD].current ++; 
                    this.foodText.text = this.configure.goals[GoalEnum.FOOD].current;                                            
                    this.wait = false;                        
                    clearInterval(_id);                                                                          
                }, 1000);                  
                break;
            }            
        }         
        if (index < 0) {
            this.eventGameOver ('Ningún alimento cercano para alimentarse');
        }     
    }

    take () {
        let index = -1;
        let positionPlayer = this.position;        
        for (let i = 0; i < this.groupObject.length; i++) {
            let object = this.groupObject.getAt(i);  

            if (positionPlayer.inRange(object.world.x + Configure.sizeSprite.width / 2, object.world.y + Configure.sizeSprite.height / 2)) {                
                index = i;
                this.soundFood.play(); 
                let _id = setInterval(
                () => {                    
                    object.kill();                        
                    this.groupObject.remove(object); 
                    
                    if (object.key === 'object_bomb') {
                        this.eventInjured(this.configure.healthMax);
                    } else {
                        this.configure.goals[GoalEnum.OBJECT].current ++; 
                        this.coinText.text = this.configure.goals[GoalEnum.OBJECT].current;                                                                    
                    }
                    this.wait = false;                                            
                    clearInterval(_id);                                                                          
                }, 1000);                  
                break;
            }            
        }         
        if (index < 0) {
            this.eventGameOver ('Ningún objeto cercano para coger');
        }     
    }

    store () {
        let index = -1;
        let positionPlayer = this.position;        
        for (let i = 0; i < this.groupFood.length; i++) {
            let food = this.groupFood.getAt(i);  

            if (positionPlayer.inRange(food.world.x + Configure.sizeSprite.width / 2, food.world.y + Configure.sizeSprite.height / 2)) {                
                index = i;                
                let _id = setInterval(
                () => {       
                    if (this.foodBag != null) {
                        food.kill();                        
                        this.groupFood.remove(food);                         
                        this.foodBag = new Food(i, food.key, food.world.x + (Configure.sizeSprite.width / 2), food.world.y + (Configure.sizeSprite.height / 2));                                                                
                        this.wait = false; 
                    } else {
                        this.eventGameOver ('Antes de recoger el alimento, tiene que soltar el almacenado');
                    }                                                                 
                    clearInterval(_id);                                                                          
                }, 500);                  
                break;
            }            
        }         
        if (index < 0) {
            this.eventGameOver ('Ningún objeto cercano para coger');
        }     
    }

    discard () {
        let index = -1;
        let positionPlayer = this.position;        
        for (let i = 0; i < this.groupObject.length; i++) {
            let object = this.groupObject.getAt(i);  

            if (positionPlayer.inRange(object.world.x + Configure.sizeSprite.width / 2, object.world.y + Configure.sizeSprite.height / 2)) {                
                index = i;                
                let _id = setInterval(
                () => {                    
                    object.kill();                        
                    this.groupObject.remove(object);                     
                    this.wait = false;                                            
                    clearInterval(_id);                                                                          
                }, 1000);                  
                break;
            }            
        }         
        if (index < 0) {
            this.eventGameOver ('Ningún alimento cercano para alimentarse');
        }     
    }

    feed () {
        if (this.foodBag != null) {
            let _id = setInterval(
                () => {                    
                    this.foodBag = null;                                    
                    this.configure.goals[GoalEnum.BABY].current ++; 
                    this.babyText.text = this.configure.goals[GoalEnum.BABY].current;                                            
                    this.wait = false;                        
                    clearInterval(_id);                                                                          
                }, 1000);              
        } else {
            this.eventGameOver ('No has recogido ningún alimento');
        }        
    }

    //#endregion

    //#region MÉTODOS AUXILIARES

    random (min, max) {
        return this.game.rnd.integerInRange(min, max);   
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

    addFoodGroup (position: Position, name: string) {
        this.groupFood.create(position.x - Configure.sizeSprite.width / 2, position.y - Configure.sizeSprite.height / 2, name);     
    }

    addObjectGroup (position: Position, name: string) {
        this.groupObject.create(position.x - Configure.sizeSprite.width / 2, position.y - Configure.sizeSprite.height / 2, name);               
    }   
    
    addSprite (position: Position, name: string) {
        let s = this.game.add.sprite(position.x - (Configure.sizeSprite.width / 2), position.y - (Configure.sizeSprite.height / 2), name);
        s.width = Configure.sizeSprite.width ;
        s.height = Configure.sizeSprite.height;
    }

    //#endregion

    //#region MÉTODOS PRIVADOS

    private eventClick() {
        let posX = parseInt(this.game.input.mousePointer.x, 10);
        let posY = parseInt(this.game.input.mousePointer.y, 10);    
        
        if (posY < Configure.sizeCanvas.height) {
                
            let messagge = 'x = ' + posX + '\ny = ' + posY;            
            let posText = new Position (posX - 15, posY - 50, true);
            let posSpeech = new Position (posX - 45, posY - 60, true);
            let image = 'speech_U_C';              
            
            // Abajo centro
            if (posY < 60 && posX > 40 && posX  < (Configure.sizeCanvas.width - 40)) {                    
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
            if (posY < 60 && posX  >= (Configure.sizeCanvas.width - 40)) {
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
            if (posY >= 60 && posX  >= (Configure.sizeCanvas.width - 40)) {
                posText.x = posX - 50;
                posSpeech.x = posX - 85;                    
                image = 'speech_U_L';
            }
            
            this.clickImage = this.game.add.sprite(posSpeech.x, posSpeech.y , image);
            this.clickText = this.game.add.text(posText.x, posText.y, messagge, Configure.stylePositionClick);

        }
    }

    private eventTime() {
        this.timeCurrent --;
        this.timeText.text = this.timeCurrent;
        if (this.timeCurrent <= 0) {
            this.eventGameOver('Fin del tiempo');                         
        }
    }

    private eventCollisionBlock() {
        this.eventGameOver('Colisión');        
    }

    private eventInjured (hurt: number) {        
        this.healthCurrent = this.healthCurrent - hurt;              
        if (this.healthCurrent <= 0) {
            this.healthCurrent = 0;
            this.eventGameOver('El organismo ha muerto');
        }
        this.healthBar.width = (this.healthCurrent * Configure.sizeBar.width) / this.configure.healthMax;
    }

    public eventGameOver (msg: string) {
        this.game.time.events.remove(this.timeEvent);                      
        this.messageGO = msg;
        this.state = StateEnum.GAMEOVER;                  
    }

    private checkGoals() {

        // Posición objetivo
        if (this.configure.goals[GoalEnum.POSITION].active) {
            if (this.position.inRange(+this.configure.goals[GoalEnum.POSITION].value_1, this.configure.goals[GoalEnum.POSITION].value_2)) {
                this.configure.goals[GoalEnum.POSITION].overcome = 1;
            }         
        }

        // Alimentos
        if (this.configure.goals[GoalEnum.FOOD].active) {
            if (this.configure.goals[GoalEnum.FOOD].current >= +this.configure.goals[GoalEnum.FOOD].value_1) {
                this.configure.goals[GoalEnum.FOOD].overcome = 1;
            }         
        }

        // Objetos
        if (this.configure.goals[GoalEnum.OBJECT].active) {
            if (this.configure.goals[GoalEnum.OBJECT].current >= +this.configure.goals[GoalEnum.OBJECT].value_1) {
                this.configure.goals[GoalEnum.OBJECT].overcome = 1;
            }         
        }

        // Alimento crias
        if (this.configure.goals[GoalEnum.BABY].active) {
            if (this.configure.goals[GoalEnum.BABY].current >= +this.configure.goals[GoalEnum.BABY].value_1) {
                this.configure.goals[GoalEnum.BABY].overcome = 1;
            }         
        }

        // Comprobamos si alguno de los objetivos no se ha conseguido     
        let overcome = 1;                
        this.configure.goals.forEach((element, index, arr) => {     
            // Exite objetivo no cumplido
            if (element.active && element.overcome === 0) {
                this.eventGameOver('Objetivos no cumplidos');
                overcome = 0;
            }

            // Exite objetivo no completado
            if (element.active && element.overcome === -1) {                
                overcome = -1;
            }                                                                         

            if (arr.length - 1 === index && overcome === 1) {
                this.state = StateEnum.LEVELUP;
            }                                                    
        });  
        


    }
    
    private checkPosition(direction): Position {
        let posPlayer = this.position;                  
        let posNext = new Position (0, 0, false);
        let positions_tmp = Object.assign([], this.configure.positionsChecked);                

        if (this.configure.goals[GoalEnum.POSITION].active) {
            positions_tmp.push(new Position(+this.configure.goals[GoalEnum.POSITION].value_1, this.configure.goals[GoalEnum.POSITION].value_2));
        }        
              
        positions_tmp.forEach(p => {
            if (!p.inRange(posPlayer.x, posPlayer.y)) {                 
                switch (direction) {
                    case 'D':                                                                      
                        if (p.inRange(posPlayer.x, posPlayer.y, 'x') && p.y > posPlayer.y && (!posNext.active || p.y < posNext.y)) {
                            posNext.assign(p);
                        }
                        break;
                    case 'U':                                                
                        if (p.inRange(posPlayer.x, posPlayer.y, 'x') && p.y < posPlayer.y && (!posNext.active || p.y > posNext.y)) {
                            posNext.assign(p);
                        }
                        break;
                    case 'R':                                                                       
                        if (p.inRange(posPlayer.x, posPlayer.y, 'y') && p.x > posPlayer.x && (!posNext.active || p.x < posNext.x)) {                                                      
                            posNext.assign(p);
                        }
                        break;
                    case 'L':                        
                        if (p.inRange(posPlayer.x, posPlayer.y, 'y') && p.x < posPlayer.x && (!posNext.active || p.x > posNext.x)) {
                            posNext.assign(p);
                        }
                        break;
                }
            }
        });        

        return posNext;        
    }

    private stopPlayer() {
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0; 
        this.player.animations.stop(true);               
    }

    //#endregion
    
}
