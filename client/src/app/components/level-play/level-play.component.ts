import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';

import { GlobalService } from '../../services/global.service';
import { LevelService } from '../../services/level.service';
import { EvolutionService } from '../../services/evolution.service';

import { Level } from '../../models/level.model';
import { Evolution } from '../../models/evolution.model';

import { Game } from '../../class/game';

@Component({
  selector: 'app-level-play',
  templateUrl: './level-play.component.html',
  styleUrls: ['./level-play.component.css']
})

export class LevelPlayComponent implements OnInit {
  
  @ViewChild('editor') editor;
  public title: string;
  public url: string;
  public level: Level;
  public evolution: Evolution;
  public game: Game;
  public code: string;
  public errorM: string;

  constructor(
    private _globalService: GlobalService,
    private _levelSercice: LevelService,
    private _evolutionService: EvolutionService,
    private _route: ActivatedRoute
  ) {
    this.title = 'Disfrute del nivel';
    this.url = this._globalService.url; 
    this.code = '';   
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

            this._evolutionService.getEvolution(this.level.evolution).subscribe(
              res => {
                if (!res.evolution) {
                  this.errorM = 'Error en el servidor';
                } else {
                  this.evolution = res.evolution;
                  this.loadCode();
                  this.loadEditor();
                  this.loadCanvas();
                }
              },
              err => {
                this.errorM = err.error.message;
              }
            );            
          }
        },
        err => {
          this.errorM = err.error.message;          
        }
      );
    });
  }

  loadCode() {
    this._levelSercice.loadCode(this.level._id).subscribe(
      res => {
        if (!res.code) {
          this.errorM = 'Error en el servidor';
        } else {          
          this.code = res.code;
        }        
      },
      err => {
        this.errorM = err.error.message;    
      }
    );
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
    this._levelSercice.registerCode(this.code, this.level._id).subscribe(
      res => {
        this.game.executeCode(this.code);
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
