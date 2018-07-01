import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import * as moment from 'moment';

// Importar servicios
import { AlertService } from '../../../services/alert.service';
import { UserService } from '../../../services/user.service';
import { EvolutionService } from '../../../services/evolution.service';
import { LevelService } from '../../../services/level.service';
import { GoalService } from '../../../services/goal.service';
import { LearningService } from '../../../services/learning.service';
import { ActionService } from '../../../services/action.service';

import { Level } from '../../../models/level.model';
import { Evolution } from '../../../models/evolution.model';


@Component({
  selector: 'app-configure-main',
  templateUrl: './configure-main.component.html',
  styleUrls: ['./configure-main.component.css']
})
export class ConfigureMainComponent implements OnInit {

  public title: string;
  public identity;
  public option: string;
  public list;  

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _alertService: AlertService,
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _goalService: GoalService,
    private _learningService: LearningService,
    private _actionService: ActionService    
  ) { 
    this.title = 'Menú configuración';
    this.identity = this._userService.getIdentity();
    this.option = '';    
  }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {   
      if (params['type']) {
        this.changeOption(params['type']);        
      } else {
        this._alertService.error('Error: No ha seleccionado ninguna acción');
      }
    });
  }

  changeOption(opt) {
    this.option = opt;    
    this.list = [];    
    switch (opt) {
      case 'user':
        this.getUsers();
        break;
      case 'evolution':
        this.getEvolutions();
        break;
      case 'level':
        this.getLevels();
        break;
      case 'goal':
        this.getGoals();
        break;
      case 'learning':
        this.getLearnings();
        break;
      case 'action':
        this.getActions();
        break;
      default:
        this._alertService.error('Error: Opción incorrecta');        
    }
  }

  /**
   * GENERACIÓN DE LISTADOS
   */

  getUsers() {
    this._userService.getUsers().subscribe(
      res => {      
        if (!res.users) {          
          this._alertService.error(res.message);          
          this.list = [];
        } else {                  
          this.list = res.users;                    
        }
      },
      err => {               
        this._alertService.error(err.error.message);   
        this.list = [];
      }
    );
  }

  getEvolutions() {
    this._evolutionService.getEvolutions().subscribe(
      res => {
        if (!res.evolutions) {
          this._alertService.error(res.message);          
        } else {  
          let cont = 0;          
          res.evolutions.forEach((item, index, array) => {
            this._levelService.getLevelsEvolution(item._id).subscribe(              
              resLevels => {                
                cont ++;
                if (resLevels.levels) {
                  item.levels = resLevels.levels;                  
                } else {
                  item.levels = [];
                }       
                
                if (cont === array.length) {                  
                  this.list = res.evolutions;                  
                }
              },
              errLevels => {
                this._alertService.error(errLevels.error.message);
              }
            );
          });
        }
      },
      err => {
        this._alertService.error(err.error.message);
        this.list = [];
      }
    );
  }

  getLevels() {
    this._levelService.getLevels().subscribe(
      res => {
        if (!res.levels) {
          this._alertService.error(res.message);
        } else {
          let cont = 0;          
          res.levels.forEach((item, index, array) => {
            this._evolutionService.getEvolutions(item.evolutionID).subscribe(              
              resEvolution => {                
                cont ++;
                if (resEvolution.evolutions && resEvolution.evolutions.length > 0) {
                  item.evolution = resEvolution.evolutions[0];                  
                } else {
                  item.evolution = new Evolution('', null, '', '', '', null, '', []);
                }       
                
                if (cont === array.length) {                  
                  this.list = res.levels;                  
                }
              },
              errLevels => {
                this._alertService.error(errLevels.error.message);
              }
            );
          });
        }
      },
      err => {
        this._alertService.error(err.error.message);
        this.list = [];
      }
    );
  }

  getGoals() {
    this._goalService.getGoals().subscribe(
      res => {
        if (!res.goals) {
          this._alertService.error(res.message);
        } else {
          this.list = res.goals;
        }
      },
      err => {
        this._alertService.error(err.error.message);
        this.list = [];
      }
    );
  }

  getLearnings() {
    this._learningService.getLearnings().subscribe(
      res => {
        if (!res.learnings) {
          this._alertService.error(res.message);
        } else {
          this.list = res.learnings;
        }
      },
      err => {
        this._alertService.error(err.error.message);
        this.list = [];
      }
    );
  }

  getActions() {
    this._actionService.getActions().subscribe(
      res => {
        if (!res.actions) {
          this._alertService.error(res.message);         
        } else {
          this.list = res.actions;
        }
      },
      err => {
        this._alertService.error(err.error.message);
        this.list = [];
      }
    );
  }

  /**
   * ELIMINACIÓN
   */

  removeUser(id) {
    this._userService.removeUser(id).subscribe(
      res => {
        if (!res.user) {
          this._alertService.error(res.message); 
        } else {
          this._alertService.success('Usuario eliminado con éxito');
          this.getUsers();
        }
      },
      err => {
        this._alertService.error(err.error.message);         
      }
    );
  }

  removeEvolution(id) {
    this._evolutionService.removeEvolution(id).subscribe(
      res => {
        if (!res.evolution) {
          this._alertService.error(res.message); 
        } else {    
          this._alertService.success('Evolución eliminada con éxito');      
          this.getEvolutions();
        }
      },
      err => {
        this._alertService.error(err.error.message); 
      }
    );
  }

  removeLevel(id) {
    this._levelService.removeLevel(id).subscribe(
      res => {
        if (!res.level) {
          this._alertService.error(res.message);
        } else {  
          this._alertService.success('Nivel eliminado con éxito');            
          this.getLevels();
        }
      },
      err => {
        this._alertService.error(err.error.message); 
      }
    );
  }

  removeGoal(id) {
    this._goalService.removeGoal(id).subscribe(
      res => {
        if (!res.goal) {
          this._alertService.error(res.message);
        } else {       
          this._alertService.success('Objetivo eliminado con éxito');   
          this.getGoals();
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  removeLearning(id) {
    this._learningService.removeLearning(id).subscribe(
      res => {
        if (!res.learning) {
          this._alertService.error(res.message);
        } else {    
          this._alertService.success('Aprendizaje eliminado con éxito');         
          this.getLearnings();
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  removeAction(id) {
    this._actionService.removeAction(id).subscribe(
      res => {
        if (!res.action) {
          this._alertService.error(res.message);
        } else {          
          this._alertService.success('Acción eliminada con éxito');  
          this.getActions();
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  formatoFecha(date: Date) {

    let resultado = '';

    if (date != null) {
      resultado = moment(date).format('DD-MM-YYYY HH:mm');
    }

    return resultado;
  }
}
