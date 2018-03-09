import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

// Importar servicios
import { GlobalService } from '../../../services/global.service';
import { UserService } from '../../../services/user.service';
import { EvolutionService } from '../../../services/evolution.service';
import { LevelService } from '../../../services/level.service';
import { GoalService } from '../../../services/goal.service';
import { LearningService } from '../../../services/learning.service';
import { ActionService } from '../../../services/action.service';
// Importar modelos
import { User } from '../../../models/user.model';
import { Evolution } from '../../../models/evolution.model';
import { Level } from '../../../models/level.model';
import { Goal } from '../../../models/goal.model';
import { Learning } from '../../../models/learning.model';
import { Action } from '../../../models/action.model';
import { Position } from '../../../models/position.model';
import { LevelGoal } from '../../../models/level_goal.model';
import { LevelLearning } from '../../../models/level_learning.model';
import { LevelAction } from '../../../models/level_action.model';

@Component({
  selector: 'app-configure-level',
  templateUrl: './configure-level.component.html',
  styleUrls: ['./configure-level.component.css']
})
export class ConfigureLevelComponent implements OnInit {

  public title: string;
  public url: string;
  public identity;
  public level: Level;
  public evolutions: Evolution[];
  // Propiedades gestión propiedad aprendizaje
  public goalsLevel: LevelGoal[];
  public goals: Goal[];
  public goalLevel: LevelGoal;
  // Propiedades gestión propiedad aprendizaje
  public learningsLevel: LevelLearning[];
  public learningLevel: LevelLearning;
  public learnings: Learning[];
  public learning: Learning;  
  // Propiedades gestión propiedad acción
  public actionsLevel: LevelAction[];
  public actionLevel: LevelAction;
  public actions: Action[];
  public action: Action; 

  public positionsLevel: Position[];
  public boolEdit: boolean;
  // Variables de ficheros
  public fileImage: Array<File>;
  public fileCode: Array<File>;
  public fileMap: Array<File>;
  // Variables con mensajes de información
  public errorMessage: Array<string>;
  public successMessage: string;
  public errorGoals: string;
  public errorLearnings: string;
  public errorActions: string;
  public errorPositions: string;

  constructor(
    private _globalService: GlobalService,
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _goalService: GoalService,
    private _learningService: LearningService,
    private _actionService: ActionService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { 
    this.boolEdit = true;
    this.title = 'Editar nivel';
    this.identity = this._userService.getIdentity();
    this.url = this._globalService.url;
    this.errorMessage = new Array<string> ();  
    this.successMessage = '';
    this.goalsLevel = new Array<LevelGoal> ();
    this.learningsLevel = new Array<LevelLearning> ();
    this.actionsLevel = new Array<LevelAction> ();    
  }

  ngOnInit() {

    this.getEvolutions();

    this._route.params.forEach((params: Params) => {              
      if (params['id']) {      
        this.goalLevel = new LevelGoal(null, params['id'] , null, null, null);  
        this.getLevel(params['id']);
        this.getGoals(params['id']);
        this.getLearnings(params['id']);        
        this.getActions(params['id']);
        this.getPositions(params['id']);
      } else {
        this.boolEdit = false;
        this.title = 'Añadir nivel';
        this.level = new Level (null, null, '', '', null, null, '', null, '', '');
      }      
    });
  }

  getLevel (id: string) {
    this._levelService.getLevel(id).subscribe(
      res => {
        if (!res.level) {
          this.errorMessage.push('No se ha podido obtener el nivel del servidor');
        } else {
          this.level = res.level;                      
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  getEvolutions () {
    this._evolutionService.getEvolutions().subscribe(
      res => {
        if (!res.evolutions) {          
          this.errorMessage.push('No se han podido obtener las evoluciones del servidor');
        } else {
          this.evolutions = res.evolutions;                      
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  getGoals (id: string) {
    this.errorGoals = '';    

    this._goalService.getGoalsLevel(id).subscribe(
      res => {
        if (!res.goals) {
          this.errorGoals = 'Ningún objetivo asociado al nivel';
          this.goalsLevel.length = 0;
        } else {
          this.goalsLevel = res.goals;                      
        }
      },
      err => {
        this.errorGoals = err.error.message;
      }
    );

    this._goalService.getGoals().subscribe(
      res => {
        if (res.goals) {
          this.goals = res.goals;
        }
      }
    );
  }

  getLearnings (id: string) {
    this.errorLearnings = '';      

    this._learningService.getLearningsLevel(id).subscribe(
      res => {
        if (!res.learnings) {
          this.errorLearnings = 'Ningún aprendizaje asociado al nivel';
        } else {
          this.learningsLevel = res.learnings;                      
        }
      },
      err => {
        this.errorLearnings = err.error.message;
      }
    );

    this._learningService.getLearnings().subscribe(
      res => {
        if (res.learnings) {
          this.learnings = res.learnings;
        }
      }
    );
  }

  getActions (id: string) {
    this.errorActions = '';    

    this._actionService.getActionsLevel(id).subscribe(
      res => {
        if (!res.actions) {
          this.errorActions = 'Ninguna acción asociada al nivel';
        } else {
          this.actionsLevel = res.actions;                      
        }
      },
      err => {
        this.errorActions = err.error.message;
      }
    );

    this._actionService.getActions().subscribe(
      res => {
        if (res.actions) {
          this.actions = res.actions;
        }
      }
    );
  }

  getPositions (id: string) {
    this.errorPositions = '';    

    this._levelService.getPositions(id).subscribe(
      res => {
        if (!res.positions) {
          this.errorPositions = 'Ninguna posición marcada en el nivel';
        } else {
          this.positionsLevel = res.positions;                      
        }
      },
      err => {
        this.errorPositions = err.error.message;
      }
    );
  }

  editLevel() {
    
    this._levelService.updateLevel(this.level).subscribe(
      res => {
        if (!res.level) {
          this.errorMessage.push('Operación no completada con éxito: ' + res.message);
        } else {        
          if (this.fileImage) {
            this.makeFileRequest(this.url + 'level-upload-I/' +  this.level._id, [], this.fileImage, 'image').then(
              (res: any) => {
                  if (res.image) {
                    this.level.image = res.image;
                  } else {
                    this.errorMessage.push('Subida de Image no realizada: ' + res.message);
                  }                       
              }
          ); }

          if (this.fileCode) {
            this.makeFileRequest(this.url + 'level-upload-code/' +  this.level._id, [], this.fileCode, 'file').then(
              (res: any) => {
                console.log(res);
                  if (res.file) {
                    this.level.code_default = res.file;                    
                  } else {
                    this.errorMessage.push('Subida de fichero con código por defecto no realizada: ' + res.message);
                  }                       
              }
          ); }

          if (this.fileMap) {
            this.makeFileRequest(this.url + 'level-upload-M/' +  this.level._id, [], this.fileMap, 'file').then(
              (res: any) => {
                  if (res.file) {
                    this.level.map = res.file;
                  } else {
                    this.errorMessage.push('Subida del mapa no realizada: ' + res.message);
                  }                       
              }
          ); }
          this.successMessage = 'Nivel actualizado correctamente';
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  activateLevel() {
    this._levelService.activateLevel(this.level._id).subscribe(
      res => {
        if (!res.level) {
          this.errorMessage.push('No se ha podido activar el nivel');
        } else {
          this.level.active = 1;                  
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  desactivateLevel() {
    this._levelService.desactivateLevel(this.level._id).subscribe(
      res => {
        if (!res.level) {
          this.errorMessage.push('No se ha podido desactivar el nivel');
        } else {
          this.level.active = 0;                  
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  onSubmit() {
    this.errorMessage = [];
    this.successMessage = '';

    if (this.boolEdit) {
      this.editLevel();
    } else {
      this.addLevel();
    }


  }

  addLevel () {
    this._levelService.addLevel(this.level).subscribe(
      res => {
        if (!res.level) {
          this.errorMessage.push('Error al añadir nivel: ' + res.message);
        } else {            
          this.successMessage = 'Nivel añadido correctamente';          
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  addGoal () {
    if (this.goalLevel) {      
      this._levelService.addGoalLevel(this.goalLevel).subscribe(
        res => {
          if (!res.level_goal) {
            this.errorGoals = 'Error: ' + res.message;
          } else {
            this.getGoals(this.level._id);                     
          }
        },
        err => {
          this.errorGoals = err.error.message;
        }
      );
    } else {
      this.errorGoals = 'No ha seleccionado ningún valor';
    }
  }

  addLearning () {

    this.errorLearnings = '';

    if (this.learning) {
      this.learningLevel = new LevelLearning(null, this.level._id, this.learning);

      this._levelService.addLearningLevel(this.learningLevel).subscribe(
        res => {
          if (!res.level_learning) {
            this.errorLearnings = 'Error: ' + res.message;
          } else {   
            this.learningLevel._id = res.level_learning._id;          
            this.learningsLevel.push(this.learningLevel);                     
          }
        },
        err => {
          this.errorLearnings = err.error.message;
        }
      );

    } else {
      this.errorLearnings = 'No ha seleccionado ningún valor';
    }
  }

  addAction () {

    this.errorActions = '';

    if (this.action) {
      this.actionLevel = new LevelAction(null, this.level._id, this.action);

      this._levelService.addActionLevel(this.actionLevel).subscribe(
        res => {
          if (!res.level_action) {
            this.errorActions = 'Error: ' + res.message;
          } else {   
            this.actionLevel._id = res.level_action._id;          
            this.actionsLevel.push(this.actionLevel);                     
          }
        },
        err => {
          this.errorActions = err.error.message;
        }
      );

    } else {
      this.errorActions = 'No ha seleccionado ningún valor';
    }
  }

  removeGoal (id: string) {
    this.errorGoals = '';
    this._levelService.removeGoalLevel(id).subscribe(
      res => {
        if (!res.level_goal) {
          this.errorGoals = 'Error: ' + res.message;
        } else {   
          this.getGoals(this.level._id);                                   
        }
      },
      err => {
        this.errorGoals = err.error.message;
      }
    );
  }

  removeLearning (id: string, index: number) {
    this.errorLearnings = '';
    this._levelService.removeLearningLevel(id).subscribe(
      res => {
        if (!res.level_learning) {
          this.errorLearnings = 'Error: ' + res.message;
        } else {            
          this.learningsLevel.splice(index, 1);                     
        }
      },
      err => {
        this.errorLearnings = err.error.message;
      }
    );
  }

  removeAction (id: string, index: number) {
    this.errorActions = '';
    this._levelService.removeActionLevel(id).subscribe(
      res => {
        if (!res.level_action) {
          this.errorActions = 'Error: ' + res.message;
        } else {            
          this.actionsLevel.splice(index, 1);                     
        }
      },
      err => {
        this.errorActions = err.error.message;
      }
    );
  }

 

  fileChangeEvent(fileInput: any, type: string) {     
    switch (type) {
      case 'image':
        this.fileImage = <Array<File>> fileInput.target.files;   
        break;
      case 'code_default':
        this.fileCode = <Array<File>> fileInput.target.files;   
        break;
      case 'map':
        this.fileMap = <Array<File>> fileInput.target.files;   
        break;
      default:
        this.errorMessage.push('Tipo de imagen desconocido');
    }           
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

}
