import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

import { Global } from '../../../enum/global';

import { AlertService } from '../../../services/alert.service';
import { UserService } from '../../../services/user.service';
import { EvolutionService } from '../../../services/evolution.service';
import { LevelService } from '../../../services/level.service';
import { ActionService } from '../../../services/action.service';
import { LearningService } from '../../../services/learning.service';
import { GoalService } from '../../../services/goal.service';

import { User } from '../../../models/user.model';
import { Evolution } from '../../../models/evolution.model';
import { Level } from '../../../models/level.model';
import { Learning } from '../../../models/learning.model';
import { Action } from '../../../models/action.model';
import { Goal } from '../../../models/goal.model';
import { LevelGoal } from '../../../models/level_goal.model';

@Component({
  selector: 'app-configure-level',
  templateUrl: './configure-level.component.html',
  styleUrls: ['./configure-level.component.css']
})
export class ConfigureLevelComponent implements OnInit {

  public title: string;
  public url: string;
  public identity;
  public file: Array<File>;
  public level: Level;
  public evolutions: Evolution[];
  public actions: Action[];
  public learnings: Learning[];
  public goals: Goal[];
  public edit: boolean;  

  public action: Action;  
  public learning: Learning;
  public levelGoal: LevelGoal;
  

  constructor(   
    private _alertService: AlertService,
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _actionService: ActionService,
    private _learningService: LearningService,
    private _goalService: GoalService,
    private _route: ActivatedRoute 
  ) {     
    this.title = 'Editar nivel';
    this.identity = this._userService.getIdentity();
    this.url = Global.url_api;
    this.edit = true;    
    this.levelGoal = new LevelGoal('', null, null, '', '', null);
  }

  ngOnInit() {
    this.getLevel();
    this.getEvolutions();
    this.getActions();
    this.getLearnings();
    this.getGoals();
  }

  getLevel () {
    this._route.params.forEach((params: Params) => {              
      if (params['id']) {              
        this._levelService.getLevels(params['id']).subscribe(
          res => {
            if (!res.levels || res.levels.length === 0) {
              this._alertService.error(res.message); 
            } else {        
              this.level = res.levels[0];               
              // Evolución
              this._evolutionService.getEvolutions(this.level._id).subscribe(
                res => {                  
                  if (!res.evolutions) {
                    this._alertService.error(res.message); 
                  } else {
                    this.level.evolution = res.evolutions[0];                      
                  }                                     
                },
                err => {
                  this._alertService.error(err.error.message);
                }
              );

              // Acciones
              this._levelService.getActions(this.level._id).subscribe(
                res => {                  
                  if (!res.actions) {
                    this._alertService.error(res.message); 
                  } else {
                    this.level.actions = [];  
                    res.actions.forEach(element => {
                      this.level.actions.push(element.actionID);
                    });                   
                  }                                     
                },
                err => {
                  this._alertService.error(err.error.message);
                }
              );

              // Aprendizaje
              this._levelService.getLearnings(this.level._id).subscribe(
                res => {                  
                  if (!res.learnings) {
                    this._alertService.error(res.message); 
                  } else {
                    this.level.learnings = [];  
                    res.learnings.forEach(element => {
                      this.level.learnings.push(element.learningID);
                    });                   
                  }                                     
                },
                err => {
                  this._alertService.error(err.error.message);
                }
              );

              // Objetivos
              this._levelService.getGoals(this.level._id).subscribe(
                res => {                  
                  if (!res.goals) {
                    this._alertService.error(res.message); 
                  } else {
                      let cont = 0;          
                      res.goals.forEach((item, index, array) => {
                        this._goalService.getGoals(item.goalID).subscribe(              
                          resG => {                                            
                            cont ++;
                            if (resG.goals && resG.goals.length > 0) {
                              item.goal = resG.goals[0];                 
                            } else {
                              item.goal = new Goal('', '', '');
                            }       
                            
                            if (cont === array.length) {                  
                              this.level.goals = res.goals;                   
                            }
                          },
                          errG => {
                            this._alertService.error(errG.error.message);
                          }
                        );
                      });                                                                                             
                  }                                     
                },
                err => {
                  this._alertService.error(err.error.message);
                }
              );

            }
          },
          err => {
            this._alertService.error(err.error.message);
          }
        );       
      } else {
        this.edit = false;
        this.title = 'Añadir nivel';
        this.level = new Level ('', null, '', '', '', null, '', null, [], [], []);
      }      
    });
  }

  getEvolutions () {
    this._evolutionService.getEvolutions().subscribe(
      res => {
        if (!res.evolutions) {          
          this._alertService.error(res.message);
        } else {
          this.evolutions = res.evolutions;                      
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  fileChangeEvent(fileInput: any, type: string) {     
    this.file = <Array<File>> fileInput.target.files;            
  }

  makeFileRequest(url: string, params: Array<string>, files: Array<File>, type: string) {

    let token = this._userService.getToken();
    
    return new Promise((resolve, reject) => {
        let formData: any = new FormData();
        let xhr = new XMLHttpRequest();

        for (let i = 0; i < files.length; i++) {
            formData.append(type, files[i], files[i].name);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ( xhr.status === 200) {
                    resolve(JSON.parse(xhr.response));
                } else {
                    reject(xhr.response);
                }
            }
        };

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Authorization', token);
        xhr.send(formData);
    });
  }

  onSubmit() {
    if (this.edit) {
      this._levelService.updateLevel(this.level).subscribe(
        res => {
          if (!res.level) {
            this._alertService.error(res.message);             
          } else {        
            if (this.file) {
              this.makeFileRequest(this.url + 'level-upload/' +  this.level._id, [], this.file, 'image').then(
                (res: any) => {
                    if (res.image) {
                      this.level.image = res.image;
                    } else {
                      this._alertService.error(res.message); 
                    }                       
                }
            );}
            this._alertService.success('Nivel actualizado correctamente');            
          }
        },
        err => {
          this._alertService.error(err.error.message);
        }
      );
    } else {
      this._levelService.addLevel(this.level).subscribe(
        res => {
          if (!res.level) {
            this._alertService.error(res.message); 
          } else {   
            this._alertService.success('Nivel añadido correctamente');            
          }
        },
        err => {
          this._alertService.error(err.error.message);
        }
      );
    }
  }    

  /**
   * Métodos para la edición de propiedades del nivel
   */

   // Acciones

  addAction () {      
    this._levelService.addAction(this.level._id, this.action._id).subscribe(
      res => {
        if (!res.level_action) {
          this._alertService.error(res.message);
        } else {                          
          this.level.actions.push(this.action);
          this.action = new Action('', null, '', '', '', '');
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  getActions () {
    this._actionService.getActions().subscribe(
      res => {
        if (!res.actions) {          
          this._alertService.error(res.message);
        } else {
          this.actions = res.actions;                      
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  removeAction (actionID: string, pos: number) {    
    this._levelService.removeAction(this.level._id, actionID).subscribe(
      res => {        
        if (!res.level_action) {
          this._alertService.error(res.message);
        } else { 
          this.level.actions.splice(pos, 1);                                   
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  // Aprendizaje
  addLearning () {      
    this._levelService.addLearning(this.level._id, this.learning._id).subscribe(
      res => {
        if (!res.level_learning) {
          this._alertService.error(res.message);
        } else {                          
          this.level.learnings.push(this.learning);
          this.learning = new Learning('', null, '', '', '', '');
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  getLearnings () {
    this._learningService.getLearnings().subscribe(
      res => {
        if (!res.learnings) {          
          this._alertService.error(res.message);
        } else {
          this.learnings = res.learnings;                      
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  removeLearning (learningID: string, pos: number) {    
    this._levelService.removeLearning(this.level._id, learningID).subscribe(
      res => {        
        if (!res.level_learning) {
          this._alertService.error(res.message);
        } else { 
          this.level.learnings.splice(pos, 1);                                   
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }


  // Objetivos

  addGoal () {      
    this.levelGoal.levelID = this.level._id;        
    this.levelGoal.goalID = this.levelGoal.goal._id;
    this._levelService.addGoal(this.levelGoal).subscribe(
      res => {
        if (!res.level_goal) {
          this._alertService.error(res.message);
        } else {                                       
          this._levelService.getGoals(this.level._id).subscribe(
            res => {                  
              if (!res.goals) {
                this._alertService.error(res.message); 
              } else {
                  let cont = 0;          
                  res.goals.forEach((item, index, array) => {
                    this._goalService.getGoals(item.goalID).subscribe(              
                      resG => {                                            
                        cont ++;
                        if (resG.goals && resG.goals.length > 0) {
                          item.goal = resG.goals[0];                 
                        } else {
                          item.goal = new Goal('', '', '');
                        }       
                        
                        if (cont === array.length) {                  
                          this.level.goals = res.goals;                   
                        }
                      },
                      errG => {
                        this._alertService.error(errG.error.message);
                      }
                    );
                  });                                                                                             
              }                                     
            },
            err => {
              this._alertService.error(err.error.message);
            }
          );
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  getGoals () {
    this._goalService.getGoals().subscribe(
      res => {
        if (!res.goals) {          
          this._alertService.error(res.message);
        } else {          
          this.goals = res.goals;                                
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  removeGoal (goalID: string, pos: number) {    
    this._levelService.removeGoal(this.level._id, goalID).subscribe(
      res => {        
        if (!res.level_goal) {
          this._alertService.error(res.message);
        } else { 
          this.level.goals.splice(pos, 1);                                   
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

}
