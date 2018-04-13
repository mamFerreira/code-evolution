import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';

// Modelos
import { Evolution } from '../../models/evolution.model';
import { Level } from '../../models/level.model';
import { LevelGoal } from '../../models/level_goal.model';
import { LevelLearning } from '../../models/level_learning.model';
import { LevelAction } from '../../models/level_action.model';
import { Position } from '../../models/position.model';
// Clases
import { Game } from '../../class/game';
import { GameAction } from '../../enum/game-action';
import { GameState } from '../../enum/game-state';
// Servicios
import { UserService } from '../../services/user.service';
import { EvolutionService } from '../../services/evolution.service';
import { LevelService } from '../../services/level.service';
import { GoalService } from '../../services/goal.service';
import { LearningService } from '../../services/learning.service';
import { ActionService } from '../../services/action.service';

@Component({
  selector: 'app-level-play',
  templateUrl: './level-play.component.html',
  styleUrls: ['./level-play.component.css']
})

export class LevelPlayComponent implements OnInit {
  
  @ViewChild('editor') editor;
  
  // Variables string
  private title: string;
  private code: string;
  private errorMsg: string;
  // Variables principales
  private game: Game;
  private evolution: Evolution;
  private level: Level;
  private goals: LevelGoal[];  
  private learnings: LevelLearning[];
  private actions: LevelAction[];
  private positions: Array <Position>; 
  private lastAction: GameAction;
  


  constructor(
    private _userService: UserService,    
    private _evolutionService: EvolutionService,
    private _levelSercice: LevelService,
    private _goalService: GoalService,
    private _learningService: LearningService,
    private _actionService: ActionService,
    
    private _route: ActivatedRoute
  ) {
    this.title = 'Disfrute del nivel';  
    this.code = '';     
    this.errorMsg = '';    
  }

  ngOnInit() {      
    this.loadLevel(); 
    this.loadEditor();    
  }

  /**
   * Carga del nivel
   */
  loadLevel() {
    this._route.params.forEach((params: Params) => {
      let id = params['id'];
      this._levelSercice.getLevel(id).subscribe(
        res => {
          if (!res.level) {
            this.errorMsg += res.message;
          } else {
            this.level = res.level;
            this.loadEvolution();            
            this.loadCode();
          }
        },
        err => {
          this.errorMsg += err.error.message;
        }
      );
    });
  }

  /**
   * Carga de la evolución
   */
  loadEvolution() {
    this._evolutionService.getEvolution(this.level.evolution).subscribe(
      res => {
        if (!res.evolution) {
          this.errorMsg += res.message;
        } else {
          this.evolution = res.evolution;
          this.loadPropertyLevel();
        }
      },
      err => {
        this.errorMsg += err.error.message;
      }
    );
  }

  /**
  * Carga de las objetivos, acciones y posiciones del nivel
  */
  loadPropertyLevel() {
    // Objetivos
    this._goalService.getGoalsLevel(this.level._id).subscribe(
      res => {
        if (!res.goals) {
          this.errorMsg += res.message;
        } else {
          this.goals = res.goals;          
          // Acciones
          this._actionService.getActionsLevel(this.level._id).subscribe(
            res => {
              if (!res.actions) {
                this.errorMsg += res.message;
              } else {
                this.actions = res.actions;
                // Posiciones
                this._levelSercice.getPositions(this.level._id).subscribe(
                  res => {
                    if (!res.positions) {
                      this.errorMsg += res.message;
                    } else {
                      this.positions = res.positions;
                      this.loadGame();
                    }
                  },
                  err => {
                    this.errorMsg += err.error.message;
                  }
                );
              }
            },
            err => {
              this.errorMsg += err.error.message;
            }
          ); 
        }
      },
      err => {
        this.errorMsg += err.error.message;
      }
    );

    // Aprendizaje
    this._learningService.getLearningsLevel(this.level._id).subscribe(
      res => {
        if (!res.learnings) {
          this.errorMsg += res.message;
        } else {
          this.learnings = res.learnings;
        }
      },
      err => {
        this.errorMsg += err.error.message;
      }
    );          
  }

  /**
   * Carga del código a mostrar en el editor
   */
  loadCode() {
    this._levelSercice.loadCode(this.level._id).subscribe(
      res => {
        if (!res.code) {
          this.errorMsg += res.message;
        } else {
          this.code = res.code;
        }
      },
      err => {
        this.errorMsg += err.error.message;
      }
    );
  }

  /**
   * Carga del juego
   */
  loadGame() {
    this.game = new Game(this._userService, this._levelSercice);
    this.game.loadState(this.level, this.evolution, this.goals, this.positions);
    this.game.loadWorker(this.actions);
  }  

  /**
   * Carga del editor
   */
  loadEditor() {
    this.editor.setTheme('eclipse');
    this.editor.setMode('python');

    this.editor.setOptions({
        fontSize: '14px'
    });
  }

  /**
   * Gestión de acciones botones de reproducción
   */
  doAction (action: GameAction) {    

    if (action !== GameAction.ChangeVolume) {
      this.lastAction = action;
    }    

    if (action === GameAction.Play) {
      if (this.game.stateGame === GameState.Init) {
        this._levelSercice.registerCode(this.code, this.level._id).subscribe(
          res => {        
            this.game.doAction(GameAction.Play, this.code);           
          },
          err => {
            this.errorMsg += err.error.message;
          }
        );          
      }
      if (this.game.stateGame === GameState.Pause) {
        this.game.doAction(GameAction.Continue);           
      }
    } else {
      this.game.doAction(action);
    }

  }
}
