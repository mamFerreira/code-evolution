import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';

export class StateMain extends Phaser.State {

    private urlResource: string;
    private url: String;
    public game: Phaser.Game;    
    public filePlayer: string;
    public fileMap: string;
    public fileTiledset: string;

    private posInitial: Position;
    private posGoal: Position;
    private positions: Position[];
    
    private map: Phaser.Tilemap;
    private layer_surface;
    private layer_block;    
    private txt;
    private cursors;    
    private player;
    private _locked: boolean;
    private _velocity: number;
    private _orderLevel: number;
    private _orderEvolution: number;
    
    
    constructor(id, url) {
        super();        
        this.url = url; 
        this.urlResource = '../../assets/resource/';
        this.game = new Phaser.Game('100%', '100%', Phaser.CANVAS, id); 
        this.positions = new Array<Position>();
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

    preload() {                                
        this.game.load.tilemap('map', this.url + 'level-load/' + this.fileMap + '/M', null, Phaser.Tilemap.TILED_JSON);
        this.game.load.image('player', this.url + 'evolution-load/' + this.filePlayer + '/P');        
        this.game.load.image('tiledset', this.url + 'evolution-load/' + this.fileTiledset + '/T');    

        if (this.posGoal) {
            this.game.load.image('pos_obj', this.urlResource + 'object/posicion_obj.png');
        }

        if (this.positions.length > 0 ) {
            this.game.load.image('pos', this.urlResource + 'object/posicion.png');
        }
    }
    
    create() {
        this.game.stage.backgroundColor = '#787878';
        this.map = this.game.add.tilemap('map');
        this.map.addTilesetImage('tiledset', 'tiledset');
        this.layer_surface = this.map.createLayer('surface');
        this.layer_block = this.map.createLayer('block');        

        if (this.posGoal) {
            this.game.add.sprite(this.posGoal.x, this.posGoal.y, 'pos_obj');
        }

        this.positions.forEach( (p) => {
            this.game.add.sprite(p.x, p.y, 'pos');
        });

        this.player = this.game.add.sprite(this.posInitial.x, this.posInitial.y , 'player');
        this.player.width = 32;
        this.player.height = 32;

        // this.map.addTilesetImage('block_tiled_set', 'tiles_block');
        
        // this.map.setCollisionBetween(1, 10000, true, this.layer_block);
        // this.layer_surface.resizeWorld();
        // this.layer_block.resizeWorld();          
        // this.game.input.onDown.add(this.onTap, this);
        // this.game.input.onUp.add(this.onTap2, this);
        // this.cursors = this._game.input.keyboard.createCursorKeys();
        // this._game.physics.enable(this._player);
        // this._player.body.collideWorldBounds = true;        
        // this.ScaleGame();
        // this._game.physics.startSystem(Phaser.Physics.ARCADE);
    }

    update() {
        // Comprobar Objetivos    
    }


    imprimirValor(value) {
        alert(value);
    }


/*
    ScaleGame() {            
        this._game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;                            
        this._game.scale.setShowAll();    
    }

    reload() {        
        this._player.position.x = 75;
        this._player.position.y = 160;
        this._player.body.velocity.x = 0;
        this._player.body.velocity.y = 0;

        this._game.paused = true;
        this._locked = false;
    }

    get player() {
        return this._player;
    }

    get locked() {
        return this._locked;
    }

    comprobarObjetivos() {
        // Objetivos posición
        if (this._posO.active) {
            if (this.comprobarPosition(this._player.position, this._posO)) {               
                this._posO.active = false;
                this._player.body.velocity.x = 0;
                this._player.body.velocity.y = 0;
            }             
        }
    }

    comprobarPosition(posP, posO) {
        if (Math.round(posP.x) === Math.round(posO.x) && Math.round(posP.y) === Math.round(posO.y)) {
            return true;
        }
        return false;
    }

    moveDirection(direction: string) {        
        this._locked = true;

        switch (direction) {
            case 'U':                
                this._player.body.velocity.y = -this._velocity;
                break;
            case 'D':
                this._player.body.velocity.y = this._velocity;
                break;
            case 'L':
                this._player.body.velocity.x = -this._velocity;
                break;
            case 'R':
                this._player.body.velocity.x = this._velocity;
                this._posO.x = this._player.position.x + 50;
                this._posO.y = this._player.position.y;
                this._posO._active = true;                
                break;
            default:                
        }
        return true;
    }         
    */
}

export class Position {
    private _x: number;
    private _y: number;
    private _active: boolean;
    private _pixel = 32;

    constructor(x, y) {
        this._x = x * this._pixel;
        this._y = y * this._pixel;        
    }

    get x(): number {
        return this._x;
    }
    set x(value: number) {
        this._x = value * this._pixel;
    }

    get y(): number {
        return this._y;
    }
    set y(value: number) {
        this._y = value * this._pixel;
    }

    get active(): boolean {
        return this._active;
    }
    set active(value: boolean) {
        this._active = value;
    }
}

