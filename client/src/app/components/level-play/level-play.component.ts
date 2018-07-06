import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';

// Modelos
import { Level } from '../../models/level.model';
import { LevelGoal } from '../../models/level_goal.model';
import { Goal } from '../../models/goal.model';
// Clases
import { Canvas } from '../../class/canvas.class';
import { GameAction } from '../../enum/game-action';
import { GameState } from '../../enum/game-state';
// Servicios
import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';
import { EvolutionService } from '../../services/evolution.service';
import { LevelService } from '../../services/level.service';
import { GoalService } from '../../services/goal.service';
import { GameService } from '../../services/game.service';

@Component({
  selector: 'app-level-play',
  templateUrl: './level-play.component.html',
  styleUrls: ['./level-play.component.css']
})

export class LevelPlayComponent implements OnInit {
  
  @ViewChild('editor') editor;  

  public title: string;  
  public identity;
  public configure: Array<boolean>;  
  public code: string;

  public level: Level;
  public canvas: Canvas;  



  
  private lastAction: GameAction;  

  constructor(    
    private _alertService: AlertService,
    private _userService: UserService,    
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _goalService: GoalService,        
    private _gameService: GameService,
    private _route: ActivatedRoute
  ) {
    this.title = 'Jugar Nivel';  
    this.identity = this._userService.getIdentity();
    this.code = '';     
    this.configure = new Array (true, true, true, true);    
  }

  ngOnInit() {
    this.loadLevel();    
  }

  loadLevel () {
    this._route.params.forEach((params: Params) => {                                
      this._levelService.getLevels(params['id']).subscribe(
        res => {
          if (!res.levels || res.levels.length === 0) {
            this._alertService.error(res.message); 
          } else {                                            
            // Evolución
            this._evolutionService.getEvolutions(res.levels[0].evolutionID).subscribe(
              resE => {                  
                if (!resE.evolutions) {
                  this._alertService.error(resE.message); 
                } else {
                  this.level = res.levels[0]; 
                  this.level.evolution = resE.evolutions[0];
                  this.loadCanvas();                  
                  this.loadEditor();                                          
                  // Acciones
                  this._levelService.getActions(this.level._id).subscribe(
                    resA => {                  
                      if (!resA.actions) {
                        this._alertService.error(resA.message); 
                      } else {
                        this.level.actions = [];  
                        resA.actions.forEach(element => {
                          this.level.actions.push(element.actionID);
                        });                   
                      }                                     
                    },
                    errA => {
                      this._alertService.error(errA.error.message);
                    }
                  );
                  // Aprendizaje
                  this._levelService.getLearnings(this.level._id).subscribe(
                    resAp => {                  
                      if (!resAp.learnings) {
                        this._alertService.error(resAp.message); 
                      } else {
                        this.level.learnings = [];  
                        resAp.learnings.forEach(element => {
                          this.level.learnings.push(element.learningID);
                        });                   
                      }                                     
                    },
                    errAp => {
                      this._alertService.error(errAp.error.message);
                    }
                  );
                  // Objetivos
                  this._levelService.getGoals(this.level._id).subscribe(
                    resO => {                  
                      if (!resO.goals) {
                        this._alertService.error(resO.message); 
                      } else {                                                                
                        resO.goals.forEach((item, index, array) => {
                            this._goalService.getGoals(item.goalID).subscribe(              
                              resG => {                                                                        
                                if (resG.goals && resG.goals.length > 0) {
                                  item.goal = resG.goals[0];                 
                                } else {
                                  item.goal = new Goal('', '', '');
                                }                                                                       
                                if (index === array.length - 1) {                  
                                  this.level.goals = resO.goals;                                            
                                }
                              },
                              errG => {
                                this._alertService.error(errG.error.message);
                              }
                            );
                          });                                                                                             
                      }                                     
                    },
                    errO => {
                      this._alertService.error(errO.error.message);
                    }
                  );
                }                                     
              },
              errE => {
                this._alertService.error(errE.error.message);
              }
            );                                    
          }
        },
        err => {
          this._alertService.error(err.error.message);
        }
      );               
    });
  }

  loadCanvas() {
    this.canvas = new Canvas(this.level);
    // this.game.loadState(this.level, this.evolution, this.goals, this.positions);
    // this.game.loadWorker(this.actions);
  }

  loadEditor() {
    this.editor.setTheme('chrome');
    this.editor.setMode('python');          

    this.editor.setOptions({
        fontSize: '12px',
        showLineNumbers: true,
        printMargin: false,
        wrap: 65,   
        tabSize: 2        
    });    
    
    // Cargamos código
    this._gameService.getGame(this.identity._id, this.level._id).subscribe(
      res => {        
        if (!res.games || res.games.length === 0 || res.games[0].code.length === 0) {          
          this._levelService.getCode(this.level._id).subscribe(
            res => {
              if (res.code) {
                this.code = res.code;
              } else {
                this.code = '';
              }
            },
            err => {
              this._alertService.error(err.error.message);      
            }
          );

        } else {
          this.code = res.games[0].code;
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  getGoalValue (goal: LevelGoal) {

    let resultado: string;

    resultado = goal.value_1 != null && goal.value_2 != null ? ' (' + goal.value_1 + ',' + goal.value_2 + ')' : ''; 
    resultado = goal.value_1 != null && goal.value_2 == null ? ' (' + goal.value_1 + ')' : resultado; 
    resultado = goal.value_1 == null && goal.value_2 != null ? ' (' + goal.value_2 + ')' : resultado; 

    return resultado;
  }

  doAction (action: GameAction) {

    if (action === GameAction.ChangeVolume) {
      this.configure[0] = !this.configure[0];
    }

    if (action !== GameAction.ChangeVolume) {
      this.lastAction = action;
    }    
    if (action === GameAction.Play) {     
      if (this.canvas.stateGame === GameState.Init) {
        if (this.code.length === 0) {
          this.canvas.doAction(GameAction.Stop);
        } else {
          // Registrar el código
        }                 
      }
      if (this.canvas.stateGame === GameState.Pause) {
        this.canvas.doAction(GameAction.Continue);           
      }
    } else {
      this.canvas.doAction(action);
    }
  }

  
  


  // Comunicación COMPONENT ---> GAME
  /*
   - EJECUTAR CÓDIGO
   - PAUSAR JUEGO
   - REINICIAR JUEGO
   - CAMBIAR VOLUMEN
   - NIVEL
   - ACCIONES
   - OBJETIVOS
  */

  // Comunicación GAME ---> COMPONENT
  /*
    - ESTADO DEL JUEGO
    - CÓDIGO DE CONSOLA
    - OBJETIVOS COMPLETADOS12
  */


}
