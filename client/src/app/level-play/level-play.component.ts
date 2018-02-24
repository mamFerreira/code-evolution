import { Component, OnInit, ViewChild } from '@angular/core';
// Importación Phaser
import {MainState} from './states/main-state';
import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';
// Importación servicios
import {LevelService} from '../services/level.service';
// Ejecución paralela
import { createWorker, ITypedWorker } from 'typed-web-workers';


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

  constructor(
    private _levelService: LevelService
  ) {
    this.text = '#Alcanca la posición objetivo\nwhile true:\n\tplayer.moveRight()';
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
    this._levelService.translateCode(this.text).subscribe(
      res => {
        if (!res.code) {
          // Error
        } else {
          this.text = res.code;
          // Ejecutar código dinámico:
          // eval(res.code);
          // Ejecutar código paralelo:
          // const typedWorker: ITypedWorker<number, number> = createWorker(this.workFn, this.logFn);
          // const typedWorker2: ITypedWorker<number, number> = createWorker(this.workFn, this.logFn);
          // typedWorker.postMessage(1000);
          // typedWorker2.postMessage(1000);
        }
      },
      err => {
        console.log(err);
      }
    );
  }

  workFn(x: number): number {
    while (x > 0) {
      console.log(x);
      x--;
    }
    return 1;
  }

  logFn(result: number) {
    console.log(`We received this response from the worker: ${result}`);
  }
}

