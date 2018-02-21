import { Component, OnInit, ViewChild } from '@angular/core';
import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';

@Component({
  selector: 'app-level-play',
  templateUrl: './level-play.component.html',
  styleUrls: ['./level-play.component.css']
})

export class LevelPlayComponent implements OnInit {

  @ViewChild('editor') editor;
  public text: string;
  public game: Phaser.Game;
  public map: Phaser.Tilemap;
  public layer;

  constructor() {
    this.text = '';
  }

  ngOnInit() {
    this.initEditor();
    this.initGame();
  }

  initEditor() {
    this.editor.setTheme('eclipse');
    this.editor.setMode('python');

    this.editor.getEditor().setOptions({
        enableBasicAutocompletion: true,
        fontSize: '14px'
    });

    /*this.editor.getEditor().commands.addCommand({
        name: 'showOtherCompletions',
        bindKey: 'Ctrl-.',
        exec: function (editor) {

        }
    });*/
  }

  initGame() {

    this.game = new Phaser.Game('100', 350, Phaser.AUTO, 'phaser-game', {
      preload: this.preload,
      create: this.create
    });
  }

  preload() {
    this.game.load.tilemap('map', '../../assets/tilemaps/maps/map1.json', null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image('tiles', '../../assets/tilemaps/tiles/rock.png');
  }

  create() {
    this.game.stage.backgroundColor = '#787878';
    this.map = this.game.add.tilemap('map');
    this.map.addTilesetImage('rock', 'tiles');
    this.layer = this.map.createLayer('World1');
    this.layer.resizeWorld();
  }

}
