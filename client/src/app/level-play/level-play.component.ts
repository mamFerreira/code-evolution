import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';
import { Game } from '../game/game';
import { LevelService } from '../services/level.service';
import { EvolutionService } from '../services/evolution.service';
import { Level } from '../models/level.model';
import { Evolution } from '../models/evolution.model';

@Component({
  selector: 'app-level-play',
  templateUrl: './level-play.component.html',
  styleUrls: ['./level-play.component.css']
})

export class LevelPlayComponent implements OnInit {
  
  @ViewChild('editor') editor;
  public title: string;
  public level: Level;
  public evolution: Evolution;
  public game: Game;
  public code: string;
  public codeTranslate: string;
  public errorM: string;

  constructor(
    private _levelSercice: LevelService,
    private _evolutionService: EvolutionService,
    private _route: ActivatedRoute
  ) {
    this.title = 'Disfrute del nivel';
  }

  ngOnInit() {
    this.load();    
  }

  load() {
    this._route.params.forEach((params: Params) => {
      let id = params['id'];
      
      this._levelSercice.getLevel(id).subscribe(
        res => {
          if (!res.level) {
            this.errorM = 'Error en el servidor';
          } else {
            this.level = res.level;
            this.evolution = res.level.evolution;
            this.code = 'moveRight();'; // imprimirValor("Hola Mundo!");'; // this.level.code;            
            this.loadEditor();
            this.loadCanvas();
          }
        },
        err => {
          this.errorM = err.error.message;          
        }
      );
    });
  }

  loadEditor() {
    this.editor.setTheme('eclipse');
    this.editor.setMode('python');

    this.editor.setOptions({        
        fontSize: '14px'
    });
  }

  loadCanvas() {
    this.game = new Game(this.level, this.evolution, 'phaser-game');
  }

  playLevel () {
    this._levelSercice.translateCode(this.code).subscribe(
      res => {
        if (!res.code) {
          this.errorM = 'Error en el servidor';
        } else {
          this.codeTranslate = res.code.code;
          this.game.executeCode(this.codeTranslate);
        }
      },
      err => {
        this.errorM = err.error.message;
      }
    );
  }

  stopLevel () {
    this.game.stopExecution();
  }
}
