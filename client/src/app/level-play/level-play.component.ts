import { Component, OnInit, ViewChild } from '@angular/core';
import {MainState} from './states/main-state';
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
  public state: MainState;

  constructor() {
    this.text = '#Alcanca la posición objetivo\nplayer.moveRight()';
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
    this.game = new Phaser.Game('100', 384, Phaser.CANVAS, 'phaser-game');
    this.state = new MainState(this.game);
    this.game.state.add('gameplay', this.state);
    this.game.state.start('gameplay');
  }

  sendCode() {
    this.state.init();
  }
}
