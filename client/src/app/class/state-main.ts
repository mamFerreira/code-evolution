import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';

let styleTime = {
    font: 'bold 20pt Arial',
    fill: '#000000',
    align: 'center'
};

let stylePositionClick = {
    font: 'bold 8pt Arial', 
    fill: '#000000',
    align: 'center'
};

export enum StateState {
    Playable,
    Blocked,
    LevelUp,
    GameOver
}


export class StateMain extends Phaser.State {
    
    // Variables principales
    public game: Phaser.Game;  
    private map: Phaser.Tilemap;
    private layer_surface: Phaser.TilemapLayer;
    private layer_block: Phaser.TilemapLayer;          
    private player;   

    // Variables de configuración
    private velocity;
    private healthBarWidth;
    public filePlayer: string;
    public fileMap: string;
    public fileTiledset: string;
    private urlResource: string;
    private url: String;      

    // Variables para intercambio de información
    public state: StateState;
    public response: string;  
    
    // Variables para mostrar posición 
    private clickPositionText;
    private clickPositionImage;

    // Variables de posición
    private posInitial: Position;
    private posGoalTmp: Position;
    private posGoal: Position;
    private positions: Position[];

    // Variables de tiempo
    public maxTime: number;    
    private currentTime: number;
    private timerGameOver;
    private timerText;

    // Variables de vida
    public maxLife: number;
    private currentLife: number;
    private healthBar;
           
    
    constructor(id, url) {
        super();        
        this.url = url; 
        this.urlResource = '../../assets/resource/';
        this.game = new Phaser.Game(515, 444, Phaser.CANVAS, id); 
        this.positions = new Array<Position>();
        this.posGoal = new Position(0, 0, false);
        this.posGoalTmp = new Position(0, 0, false);
        this.state = StateState.Playable;
        this.velocity = 64;
        this.healthBarWidth = 250;        
    }

    reload() {
        this.player.x = this.posInitial.x;
        this.player.y = this.posInitial.y;
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        this.response = null;
        this.state = StateState.Playable;
        this.posGoalTmp = new Position(0, 0, false);    

        // Tiempo
        this.currentTime = this.maxTime;
        this.timerText.text = 'Time: ' + this.currentTime;
        this.game.time.events.remove(this.timerGameOver);  
        this.timerGameOver = this.game.time.events.loop(Phaser.Timer.SECOND, this.eventTime, this);
        
    }

    preload() {                        
        // Carga map, player y tiledset        
        this.game.load.tilemap('map', this.url + 'level-load/' + this.fileMap + '/M', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('player', this.url + 'evolution-load/' + this.filePlayer + '/P');        
        this.game.load.image('tiledset', this.url + 'evolution-load/' + this.fileTiledset + '/T');    
        // Carga elementos barra marcador
        this.game.load.image('health', this.urlResource + 'object/health.png');
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
    }
    
    create() {
        // Elementos principales
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.stage.backgroundColor = '#FFFFFF';
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('tiledset', 'tiledset');
        this.layer_surface = this.map.createLayer('surface');
        this.layer_block = this.map.createLayer('block');   
        
        // Marcador
        let scoreBoard = this.game.add.graphics();
        scoreBoard.lineStyle(2, 0x000000, 1);
        scoreBoard.drawRect(0, 383, 515, 64);
        let healthBoard = this.game.add.graphics();
        healthBoard.lineStyle(2, 0x000000, 1);
        healthBoard.drawRect(100, 396, this.healthBarWidth + 2, 34);
        this.game.add.image(36, 398, 'health');        

        
        // Posición objetivo
        if (this.posGoal.active) {
            this.game.add.sprite(this.posGoal.x, this.posGoal.y, 'pos_obj');
        }
        // Posiciones habilitadas
        this.positions.forEach( (p) => {
            this.game.add.sprite(p.x, p.y, 'pos');
        });
        // Player
        this.player = this.game.add.sprite(this.posInitial.x, this.posInitial.y , 'player');
        this.player.width = 32;
        this.player.height = 32;
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

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

        // Tiempo
        this.currentTime = this.maxTime;
        this.timerText = this.game.add.text(this.game.width / 1.2, 410, 'Time: ' + this.currentTime, styleTime);
        this.timerText.anchor.setTo(0.5);
        this.timerGameOver = this.game.time.events.loop(Phaser.Timer.SECOND, this.eventTime, this);

        // Barra de vida
        this.currentLife = this.maxLife;
        let bmd = this.game.add.bitmapData(this.healthBarWidth, 32);
        bmd.ctx.beginPath();
        bmd.ctx.rect(0, 0, this.healthBarWidth, 32);
        bmd.ctx.fillStyle = '#21610B';
        bmd.ctx.fill();
        this.healthBar = this.game.add.sprite(101, 397, bmd);        

        // Pausar juego
        this.game.paused = true;                
    }

    drawSpeechClick() {
        let posX = parseInt(this.game.input.mousePointer.x, 10);
        let posY = parseInt(this.game.input.mousePointer.y, 10);    
        
        if (posY > 380) {
            return;
        }
        let messagge = 'x = ' + posX + '\ny = ' + posY;
        // Arriba centro por defecto
        let posText = new Position (posX - 15, posY - 50, true, 1);
        let posSpeech = new Position (posX - 45, posY - 60, true, 1);
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
        this.currentTime --;
        this.timerText.text = 'Time: ' + this.currentTime;
        if (this.currentTime <= 0) {
            this.game.time.events.remove(this.timerGameOver);                
            this.state = StateState.GameOver;                
        }
    }

    update() {
                
        /*if (this.currentLife > 0) {
            this.currentLife -= 1;
            this.healthBar.width = (this.currentLife * this.healthBarWidth) / this.maxLife;                      
        }*/           

        // Comprobar objetivo posición temporal   
        if (this.posGoalTmp.active && this.posGoalTmp.check(this.player.body.x, this.player.body.y)) {            
            this.stopPlayer();
            this.state = StateState.Playable;         
        }  

        // Comprobar posición objetivo final
        if (this.posGoal.active && this.posGoal.check(this.player.body.x, this.player.body.y)){            
            this.game.paused = true;
            this.state = StateState.LevelUp;
        }                
    }

    addGoal(type, v1, v2) {
        if (type === 'position') {
            this.posGoal = new Position(v1, v2);
        }
    }

    addPosition (x, y, init = false) {
        if (init) {
            this.posInitial = new Position(x, y);
        } else {
            let p = new Position(x, y);            
            this.positions.push(p);
        }
    }

    nextPosition(direction): Position {
        let posPlayer = new Position (this.player.body.x, this.player.body.y, true, 1);        
        let posNext = new Position (0, 0, false);     
        let positions_tmp = Object.assign([], this.positions);
        positions_tmp.push(this.posGoal);
        positions_tmp.forEach(p => {
            if (!posPlayer.check(p.x, p.y)) {                
                switch (direction) {
                    case 'D':                        
                        if (p.x === posPlayer.x && p.y > posPlayer.y && (!posNext.active || p.y < posNext.y)) {
                            posNext.assign(p);
                        }
                        break;
                    case 'U':
                        if (p.x === posPlayer.x && p.y < posPlayer.y && (!posNext.active || p.y > posNext.y)) {
                            posNext.assign(p);
                        }
                        break;
                    case 'R':                        
                        if (p.y === posPlayer.y && p.x > posPlayer.x && (!posNext.active || p.x < posNext.x)) {
                            posNext.assign(p);
                        }
                        break;
                    case 'L':                        
                        if (p.y === posPlayer.y && p.x < posPlayer.x && (!posNext.active || p.x > posNext.x)) {
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
        this.player.body.x = this.posGoalTmp.x;
        this.player.body.y = this.posGoalTmp.y;
        this.posGoalTmp.active = false;
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
            this.state = StateState.Blocked;            
        } else {
            this.state = StateState.GameOver;
        }        
    } 

    imprimirValor(value) {
        console.log(value);
    }

}

export class Position {
    private _x: number;
    private _y: number;
    private _active: boolean;    

    constructor(x, y, active = true, pixel = 32) {
        this._x = x * pixel;
        this._y = y * pixel;        
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

    check(x: number, y: number) {
        let range = 1;
        if ((x < this._x + range && x > this._x - range) && (y < this._y + range && y > this._y - range)) {
            return true;
        } else {
            return false;
        }
    }

    assign(p: Position) {
        this._x = p.x;
        this._y = p.y;
        this._active = p.active;
    }
}

