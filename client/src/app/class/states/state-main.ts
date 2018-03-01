import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';


export class StateMain extends Phaser.State {

    private _game: Phaser.Game;
    private map: Phaser.Tilemap;
    private layer_surface;
    private layer_block;    
    private txt;
    private cursors;    
    private _player;
    private _locked: boolean;
    private _velocity: number;
    
    constructor(game) {
        super();
        this._game = game; 
        this._velocity = 25;        
    }

    preload(e: string, l: string) {
        let url = '../../assets/tilemaps/';        
        // Carga del mapa
        this._game.load.tilemap('map', url + 'maps/map' + e + '_' + l + '.json', null, Phaser.Tilemap.TILED_JSON);
        // Carga de la imagen del jugador
        this._game.load.image('player', url + 'player/Evolution_' + e +  '.png');
        // Carga de tileset
        this._game.load.image('tiles_floor', url + '/tileset/floor_' + e + '.png');
        this._game.load.image('tiles_block', url + '/tileset/block_' + e + '.png');
        // Comprobar si hay que cargar más objetos: posiciones disponibles y objetivo, enemigos, alimento, ....
    }

    create() {
        this._game.physics.startSystem(Phaser.Physics.ARCADE);
        this._game.stage.backgroundColor = '#787878';
        this.map = this._game.add.tilemap('map');
        this.map.addTilesetImage('floor_tiled_set', 'tiles_floor');
        this.map.addTilesetImage('block_tiled_set', 'tiles_block');
        this.layer_surface = this.map.createLayer('surface');
        this.layer_block = this.map.createLayer('block');
        this.map.setCollisionBetween(1, 10000, this.layer_block.layer.properties.collision, this.layer_block);
        this.layer_surface.resizeWorld();
        this.layer_block.resizeWorld();  
        this._player = this._game.add.sprite(0, 0, 'player');            
        // this.game.input.onDown.add(this.onTap, this);
        // this.game.input.onUp.add(this.onTap2, this);
        this.cursors = this._game.input.keyboard.createCursorKeys();
        this._game.physics.enable(this._player);
        this._player.body.collideWorldBounds = true;        

        this.reload();
    }

    update() {             
    }

    reload() {        
        this._player.position.x = 75;
        this._player.position.y = 160;
        this._player.body.velocity.x = 0;
        this._player.body.velocity.y = 0;

        this._game.paused = true;
        this._locked = false;
    }

    game(): Phaser.Game {
        return this._game;
    }

    get player() {
        return this._player;
    }

    get locked() {
        return this._locked;
    }

    moveDirection(direction: string) {        
        this._locked = true;

        switch (direction) {
            case 'U':
                console.log('Hola Mundo');
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
                break;
            default:                
        }

        return true;

    }       
}
