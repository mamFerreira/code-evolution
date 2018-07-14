import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params, Router} from '@angular/router';

// Modelos
import { Level } from '../../models/level.model';
import { LevelGoal } from '../../models/level_goal.model';
import { Goal } from '../../models/goal.model';
import { Game } from '../../models/game.model';
// Clases
import { Canvas } from '../../class/canvas.class';
import { StateEnum } from '../../enum/state.enum';
import { ActionEnum } from '../../enum/action.enum';
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
  styleUrls: ['./level-play.component.css'],
})

export class LevelPlayComponent implements OnInit {
  
  @ViewChild('editor') editor;  

  public title: string;  
  public identity;
  public configure: Array<boolean>;  
  public code: string;
  public level: Level;
  public canvas: Canvas;    

  constructor(    
    private _alertService: AlertService,
    private _userService: UserService,    
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _goalService: GoalService,        
    private _gameService: GameService,
    private _route: ActivatedRoute,
    private _router: Router,    
  ) {    
    this.title = 'Jugar Nivel';  
    this.identity = this._userService.getIdentity();
    this.code = '';     
    this.configure = new Array (true, true, true, true);    
  }

  get state(): StateEnum {
    return this.canvas != null ? this.canvas.state : StateEnum.UNDEFINED;
  }

  get console(): String {
    return this.canvas != null ? 'Code Evolution...\n' + this.canvas.console : '';
  }

  get msgGO(): String {
    return this.canvas != null ? this.canvas.messageGO : '';
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
                  this.loadEditor();                                          
                  // Acciones
                  this._levelService.getActions(this.level._id).subscribe(
                    resA => {                  
                      if (!resA.actions) {
                        this._alertService.error(resA.message); 
                      } else {                        
                        this.level.actions = [];                          
                        resA.actions.forEach((item, index, array) => {
                          this.level.actions.push(item.actionID);                          
                          if (index === resA.actions.length - 1) {
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
                                            this.loadCanvas();                                          
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

  goalFormat (goal: LevelGoal): string {

    let resultado: string;

    resultado = goal.value_1 != null && goal.value_2 != null ? ' (' + goal.value_1 + ',' + goal.value_2 + ')' : ''; 
    resultado = goal.value_1 != null && goal.value_2 == null ? ' (' + goal.value_1 + ')' : resultado; 
    resultado = goal.value_1 == null && goal.value_2 != null ? ' (' + goal.value_2 + ')' : resultado; 

    return resultado;
  }

  goalCheck (key: string): number {
    return this.canvas != null ? this.canvas.goalCheck(key) : -1;
  }

  executeAction (action: ActionEnum) {
    
    // Registramos el código si play y no esta pausado
    if (action === ActionEnum.PLAY && this.canvas.state !== StateEnum.PAUSED) {
        let game = new Game('', this.code, false, this.identity._id, this.level._id);
        
        this._gameService.registerGame(game).subscribe(
          res => {              
            if (!res.game) {
              this._alertService.error(res.message); 
            } else {
              this.canvas.doAction(action, this.code);
            }
          },
          err => {
            this._alertService.error(err.error.message);      
          }
        );
    } else {
      this.canvas.doAction(action);
    }
    // Lanzamos la acción en el canvas
  }

  levelUp (next = true) { 

    let nextLevel = this.level.order + 1;
    let nextEvolution = this.level.evolution.order + 1;

    // Marcamos nivel como superado
    this._gameService.registerGame(new Game('', '', true, this.identity._id, this.level._id)).subscribe(      
      res => {      
        if (!res.game) {
          this._alertService.error(res.message); 
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );

    // Comprobamos si existe siguiente nivel en evolución
    this._levelService.getLevelsEvolution(this.level.evolution._id, nextLevel.toString()).subscribe(
      res => {              
        if (!res.levels) {
          this._alertService.error(res.message); 
        } else {
         if (res.levels.length > 0) {          
          this._gameService.registerGame(new Game('', '', false, this.identity._id, res.levels[0]._id)).subscribe(
            resL => {
              if (!resL.game) {
                this._alertService.error(resL.message); 
              } else if (next) {
                this._router.navigate(['/jugar/evolucion/' + this.level.evolution._id]);   
              }
            },
            errL => {
              this._alertService.error(errL.error.message); 
            }
          );
         } else {
          this._evolutionService.getEvolutions('', nextEvolution.toString()).subscribe(
            resE => {
              if (!resE.evolutions) {
                this._alertService.error(resE.message); 
              } else {
                if (resE.evolutions.length > 0) {
                  this._levelService.getLevelsEvolution(resE.evolutions[0]._id, '1').subscribe(
                    resL => {
                      if (!resL.levels) {
                        this._alertService.error(resL.message); 
                      } else {
                        if (resL.levels.length === 0) {
                          this._alertService.error('La siguiente evolución no tiene nivel con orden 1'); 
                        } else {
                          this._gameService.registerGame(new Game('', '', false, this.identity._id, resL.levels[0]._id)).subscribe(
                            resG => {
                              if (!resG.game) {
                                this._alertService.error(resG.message); 
                              } else if (next) {
                                this._router.navigate(['/jugar']);   
                              }
                            },
                            errG => {
                              this._alertService.error(errG.error.message); 
                            }
                          );
                        }
                      }
                    },
                    errL => {
                      this._alertService.error(errL.error.message);
                    }
                  );
                } else {
                  console.log('Juego pasado');                  
                }
              }
            },
            errE => {
              this._alertService.error(errE.error.message);
            }
          );
         }
        }
      },
      err => {
        this._alertService.error(err.error.message);      
      }
    );
  }
}
