import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';

import { GlobalService } from '../../services/global.service';
import { EvolutionService } from '../../services/evolution.service';
import { LevelService } from '../../services/level.service';
import { GoalService } from '../../services/goal.service';
import { LearningService } from '../../services/learning.service';
import { ActionService } from '../../services/action.service';

import { Evolution } from '../../models/evolution.model';
import { Level } from '../../models/level.model';
import { LevelGoal } from '../../models/level_goal.model';
import { LevelLearning } from '../../models/level_learning.model';
import { LevelAction } from '../../models/level_action.model';
import { Position } from '../../models/position.model';

import { Game, StateGame } from '../../class/game';

@Component({
  selector: 'app-level-play',
  templateUrl: './level-play.component.html',
  styleUrls: ['./level-play.component.css']
})

export class LevelPlayComponent implements OnInit {
  
  @ViewChild('editor') editor;
  public title: string;
  public url: string;
  public errorMessage: string;
  public code: string;

  public game: Game;
  public stateStarted: boolean;
  public workerDefined: boolean;

  public evolution: Evolution;
  public level: Level;
  public goals: LevelGoal[];
  public learnings: LevelLearning[];
  public actions: LevelAction[];
  public positions: Position[]; 
  public action: string; 

  constructor(
    private _globalService: GlobalService,
    private _evolutionService: EvolutionService,
    private _levelSercice: LevelService,
    private _goalService: GoalService,
    private _learningService: LearningService,
    private _actionService: ActionService,
    
    private _route: ActivatedRoute
  ) {
    this.title = 'Disfrute del nivel';
    this.url = this._globalService.url;     
    this.code = ''; 
    this.action = '';
    this.errorMessage = ''; 
    this.stateStarted = false;   
    this.workerDefined = false;  
  }

  ngOnInit() {   
    this.loadLevel(); 
    this.loadEditor();
    this.game = new Game('phaser-game', this.url);  
  }

  loadLevel() {
    this._route.params.forEach((params: Params) => {
      let id = params['id'];
      
      this._levelSercice.getLevel(id).subscribe(
        res => {
          if (!res.level) {
            this.errorMessage += res.message;
          } else {
            this.level = res.level;            
            this.loadEvolution();           
            this.loadCode();                                                     
          }
        },
        err => {
          this.errorMessage += err.error.message;          
        }
      );
    });
  }

  loadEvolution() {
    this._evolutionService.getEvolution(this.level.evolution).subscribe(
      res => {
        if (!res.evolution) {
          this.errorMessage += res.message;
        } else {
          this.evolution = res.evolution;          
          this.loadPropertyLevel();                         
        }
      },
      err => {
        this.errorMessage += err.error.message;
      }
    );    
  }

  loadPropertyLevel() {
    // Objetivos
    this._goalService.getGoalsLevel(this.level._id).subscribe(
      res => {
        if (!res.goals) {
          this.errorMessage += res.message;
        } else {
          this.goals = res.goals;           
          // Acciones
          this._actionService.getActionsLevel(this.level._id).subscribe(
            res => {
              if (!res.actions) {
                this.errorMessage += res.message;
              } else {
                this.actions = res.actions;                   
                // Posiciones
                this._levelSercice.getPositions(this.level._id).subscribe(
                  res => {
                    if (!res.positions) {
                      this.errorMessage += res.message;
                    } else {
                      this.positions = res.positions;                          
                      this.stateStarted = this.game.initState(this.level, this.evolution, this.goals, this.positions);     
                      this.workerDefined = this.game.defineWorker(this.actions);                 
                    }
                  },
                  err => {
                    this.errorMessage += err.error.message;
                  }
                );       
              }
            },
            err => {
              this.errorMessage += err.error.message;
            }
          );          
        }
      },
      err => {
        this.errorMessage += err.error.message;
      }
    ); 

    // Aprendizaje
    this._learningService.getLearningsLevel(this.level._id).subscribe(
      res => {
        if (!res.learnings) {
          this.errorMessage += res.message;
        } else {
          this.learnings = res.learnings;
        }
      },
      err => {
        this.errorMessage += err.error.message;
      }
    );          
  }

  loadCode() {
    this._levelSercice.loadCode(this.level._id).subscribe(
      res => {
        if (!res.code) {
          this.errorMessage += res.message;
        } else {          
          this.code = res.code;
        }        
      },
      err => {
        this.errorMessage += err.error.message;    
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

  play () {
    if (this.game.stateGame === StateGame.Init) {
      this._levelSercice.registerCode(this.code, this.level._id).subscribe(
        res => {        
          this.game.play(this.code);          
        },
        err => {
          this.errorMessage += err.error.message;
        }
      );
      
    }
    
    if (this.game.stateGame === StateGame.Pause){
      this.game.continue();            
    }
  }
}
