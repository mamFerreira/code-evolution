import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

// Importar servicios
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
import { Global } from '../../../enum/global';

@Component({
  selector: 'app-configure-level',
  templateUrl: './configure-level.component.html',
  styleUrls: ['./configure-level.component.css']
})
export class ConfigureLevelComponent implements OnInit {

  public title: string;
  public url: string;
  public identity;
  public boolEdit: boolean;  
  public level: Level;
  public evolutions: Evolution[];
  // Propiedades gestión mensajes de error y éxito
  public errorMessage: Array<string>;  
  public successMessage: string;
  public errorProperty: Array<string> = ['', '', '', ''];  
  // Propiedades gestión aprendizaje
  public goals: Goal[];  
  public levelGoal: LevelGoal;
  public levelGoals: LevelGoal[];  
  // Propiedades gestión aprendizaje
  public learnings: Learning[];  
  public levelLearning: LevelLearning;  
  public levelLearnings: LevelLearning[];  
  // Propiedades gestión acción
  public actions: Action[];
  public levelActions: LevelAction[];
  public levelAction: LevelAction;
  // Propiedades gestión posición
  public levelPositions: Position[];
  public position: Position;  
  // Propiedades gestión subida de ficheros
  public fileImage: Array<File>;
  public fileCode: Array<File>;
  public fileMap: Array<File>;   

  constructor(   
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _goalService: GoalService,
    private _learningService: LearningService,
    private _actionService: ActionService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {     
    this.title = 'Editar nivel';
    this.identity = this._userService.getIdentity();
    this.url = Global.url_api;
    this.boolEdit = true;
    this.successMessage = '';
    this.errorMessage = new Array<string> ();       
  }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {              
      if (params['id']) {              
        this.getLevel(params['id']);
        this.getGoals(params['id'], true);
        this.getLearnings(params['id'], true);        
        this.getActions(params['id'], true);
        this.getPositions(params['id']);
        this.init(params['id']);        
      } else {
        this.boolEdit = false;
        this.title = 'Añadir nivel';
        this.level = new Level ('', null, '', '', '', '', null, '', null, '', '');
      }      
    });
    this.getEvolutions();
  }

  init(id) {
    this.levelGoal = new LevelGoal (null, id, null, null, null);
    this.levelLearning = new LevelLearning (null, id, null);
    this.levelAction = new LevelAction (null, id, null);
    this.position = new Position (null, id, null, null);
    // Array    
    this.levelGoals = new Array<LevelGoal>(); 
    this.levelLearnings = new Array<LevelLearning>();
    this.levelActions = new Array<LevelAction>();
    this.levelPositions = new Array<Position>();
  }


  /**
   * Métodos para añadir/editar nivel
   */

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

  onSubmit() {
    this.errorMessage.length = 0;
    this.successMessage = '';

    if (this.boolEdit) {
      this.editLevel();
    } else {
      this.addLevel();
    }
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

  /**
   * Métodos para la subida de ficheros
   */

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


  /**
   * Métodos para la edición de propiedades del nivel
   */

  getGoals (id: string, all: boolean) {
    this.errorProperty[0] = '';    

    this._goalService.getGoalsLevel(id).subscribe(
      res => {
        if (!res.goals) {
          this.errorProperty[0] = 'Ningún objetivo asociado al nivel';          
          this.levelGoals.length = 0;
        } else {
          this.levelGoals = res.goals;                      
        }
      },
      err => {
        this.errorProperty[0] = err.error.message;
      }
    );

    if (all) {
      this._goalService.getGoals().subscribe(
        res => {
          if (res.goals) {
            this.goals = res.goals;
          }
        }
      );
    } 
  }

  getLearnings (id: string, all: boolean) {
    this.errorProperty[1] = '';    

    this._learningService.getLearningsLevel(id).subscribe(
      res => {
        if (!res.learnings) {
          this.errorProperty[1] = 'Ningún aprendizaje asociado al nivel';          
          this.levelLearnings.length = 0;
        } else {
          this.levelLearnings = res.learnings;                      
        }
      },
      err => {
        this.errorProperty[1] = err.error.message;
      }
    );

    if (all) {
      this._learningService.getLearnings().subscribe(
        res => {
          if (res.learnings) {
            this.learnings = res.learnings;
          }
        }
      );
    } 
  }

  getActions (id: string, all: boolean) {
    this.errorProperty[2] = '';    

    this._actionService.getActionsLevel(id).subscribe(
      res => {
        if (!res.actions) {
          this.errorProperty[2] = 'Ninguna acción asociada al nivel';
          this.levelActions.length = 0;
        } else {
          this.levelActions = res.actions;                      
        }
      },
      err => {
        this.errorProperty[2] = err.error.message;
      }
    );

    if (all) {
      this._actionService.getActions().subscribe(
        res => {
          if (res.actions) {
            this.actions = res.actions;
          }
        }
      );
    } 
  }

  getPositions (id: string) {
    this.errorProperty[3] = '';    

    this._levelService.getPositions(id).subscribe(
      res => {
        if (!res.positions) {
          this.errorProperty[3] = 'Ninguna posición marcada en el nivel';
          this.levelPositions.length = 0;
        } else {
          this.levelPositions = res.positions;                      
        }
      },
      err => {
        this.errorProperty[3] = err.error.message;
      }
    );
  }
 
  addGoal () {      
    this._levelService.addGoalLevel(this.levelGoal).subscribe(
      res => {
        if (!res.level_goal) {
          this.errorProperty[0] = 'Error: ' + res.message;
        } else {      
          this.errorProperty[0] = '';   
          this.levelGoal._id = null;
          this.levelGoal.goal = null;
          this.levelGoal.value1 = null;
          this.levelGoal.value2 = null;   
          this.getGoals(this.level._id, false);                              
        }
      },
      err => {
        this.errorProperty[0] = err.error.message;
      }
    );
  }

  addLearning () {      
    this._levelService.addLearningLevel(this.levelLearning).subscribe(
      res => {
        if (!res.level_learning) {
          this.errorProperty[1] = 'Error: ' + res.message;
        } else {      
          this.errorProperty[1] = '';
          this.levelLearning._id = null;
          this.levelLearning.learning = null;      
          this.getLearnings(this.level._id, false);                              
        }
      },
      err => {
        this.errorProperty[1] = err.error.message;
      }
    );
  }

  addAction () {      
    this._levelService.addActionLevel(this.levelAction).subscribe(
      res => {
        if (!res.level_action) {
          this.errorProperty[2] = 'Error: ' + res.message;
        } else {      
          this.errorProperty[2] = '';      
          this.levelAction._id = null;
          this.levelAction.action = null;     
          this.getActions(this.level._id, false);                              
        }
      },
      err => {
        this.errorProperty[2] = err.error.message;
      }
    );
  }

  addPosition () {      
    this._levelService.addPosition(this.position, this.level._id).subscribe(
      res => {
        if (!res.position) {
          this.errorProperty[3] = 'Error: ' + res.message;
        } else {      
          this.errorProperty[3] = '';  
          this.position._id = null;    
          this.position.value_x = null;
          this.position.value_y = null;
          this.getPositions(this.level._id);                              
        }
      },
      err => {
        this.errorProperty[3] = err.error.message;
      }
    );
  }

  removeGoal (id: string) {    
    this._levelService.removeGoalLevel(id).subscribe(
      res => {
        if (!res.level_goal) {
          this.errorProperty[0] = 'Error: ' + res.message;
        } else { 
          this.errorProperty[0] = '';  
          this.getGoals(this.level._id, false);                                   
        }
      },
      err => {
        this.errorProperty[0] = err.error.message;
      }
    );
  }

  removeLearning (id: string) {    
    this._levelService.removeLearningLevel(id).subscribe(
      res => {
        if (!res.level_learning) {
          this.errorProperty[1] = 'Error: ' + res.message;
        } else { 
          this.errorProperty[1] = '';  
          this.getLearnings(this.level._id, false);                                   
        }
      },
      err => {
        this.errorProperty[1] = err.error.message;
      }
    );
  }

  removeAction (id: string) {    
    this._levelService.removeActionLevel(id).subscribe(
      res => {
        if (!res.level_action) {
          this.errorProperty[2] = 'Error: ' + res.message;
        } else { 
          this.errorProperty[2] = '';  
          this.getActions(this.level._id, false);                                   
        }
      },
      err => {
        this.errorProperty[2] = err.error.message;
      }
    );
  }

  removePosition (id: string) {    
    this._levelService.removePosition(id).subscribe(
      res => {
        if (!res.position) {
          this.errorProperty[3] = 'Error: ' + res.message;
        } else { 
          this.errorProperty[3] = '';  
          this.getPositions(this.level._id);                                   
        }
      },
      err => {
        this.errorProperty[3] = err.error.message;
      }
    );
  }

}
