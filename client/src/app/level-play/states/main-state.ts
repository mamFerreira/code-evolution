import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';


export class MainState extends Phaser.State {

    private game: Phaser.Game;
    private map: Phaser.Tilemap;
    private layer_surface;
    private layer_block;
    private player;
    private txt;
    private cursors;

    constructor(game: Phaser.Game) {
      super();
      this.game = game;
    }

    preload() {
      // Carga del mapa
      this.game.load.tilemap('map', '../../assets/tilemaps/maps/map1.json', null, Phaser.Tilemap.TILED_JSON);
      // Carga de la imagen del jugador
      this.game.load.image('player', '../../assets/tilemaps/player/1.png');
      // Carga de tileset
      this.game.load.image('tiles_water', '../../assets/tilemaps/tileset/water.png');
      this.game.load.image('tiles_rock', '../../assets/tilemaps/tileset/rock.png');
      // Carga objetos iniciales
      this.game.load.image('position',  '../../assets/tilemaps/objects/posicion.png');
      this.game.load.image('positionO',  '../../assets/tilemaps/objects/posicion_obj.png');
    }


    create() {
      this.game.physics.startSystem(Phaser.Physics.ARCADE);
      this.game.stage.backgroundColor = '#787878';
      this.map = this.game.add.tilemap('map');
      this.map.addTilesetImage('water_tiled_set', 'tiles_water');
      this.map.addTilesetImage('rock_tiled_set', 'tiles_rock');
      this.layer_surface = this.map.createLayer('surface');
      this.layer_block = this.map.createLayer('block');

      this.map.setCollisionBetween(1, 10000, this.layer_block.layer.properties.collision, this.layer_block);

      this.layer_surface.resizeWorld();
      this.layer_block.resizeWorld();


      this.game.add.sprite(75, 125, 'position');
      this.game.add.sprite(175, 125, 'position');
      this.game.add.sprite(175, 225, 'position');
      this.game.add.sprite(275, 225, 'position');
      this.game.add.sprite(375, 225, 'positionO');
      this.game.add.sprite(75, 325, 'position');
      this.game.add.sprite(175, 325, 'position');


      this.player = this.game.add.sprite(75, 225, 'player');

      this.game.paused = true;
      // this.game.input.onDown.add(this.onTap, this);
      // this.game.input.onUp.add(this.onTap2, this);
      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.game.physics.enable(this.player);
      this.player.body.collideWorldBounds = true;
    }

    update() {
        this.game.physics.arcade.collide(this.player, this.layer_block);
   


            if (this.cursors.right.isDown) {
                this.player.body.velocity.x += 5;
            } else if (this.cursors.left.isDown) {
                this.player.body.velocity.x -= 5;
            } else if (this.cursors.up.isDown) {
                this.player.body.velocity.y -= 5;
            } else if (this.cursors.down.isDown) {
                this.player.body.velocity.y += 5;
            }

    }

    init() {
      this.game.paused = false;
    }

    onTap() {
      let pX = this.game.input.x;
      let pY = this.game.input.y;
      let style = { font: '12px Arial', backgroundColor: 'white'};
      this.txt = this.game.add.text(pX, pY, 'Pos X:' + pX + ' Pos Y:' + pY, style);
    }

    onTap2() {
        this.txt.destroy();
    }

  }

  /**
   * Variables globales:
   * URL tilemaps
   *
   * Variables BBDD
   * - texto inicial editor (Nivel)
   * - mapa.json (Nivel)
   * - imagen player (Evolucion)
   * - posicion inicial player (Nivel)
   * - tiledset (Evolución)
   * - Objetivos: (Nivel)
   * -----Si posición objetivo: Posición objetivo, posiciones disponibles para moverse
   */