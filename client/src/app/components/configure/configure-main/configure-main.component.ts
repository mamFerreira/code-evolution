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
  public errorMessage: string;

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
      }
    });
  }

  changeOption(opt) {
    this.option = opt;    
    this.list = [];
    this.errorMessage = '';
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
        this.errorMessage = 'Error: Opción incorrecta';
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
          this.errorMessage = 'Error al obtener listado de evoluciones';
        } else {
          this.list = res.evolutions;
        }
      },
      err => {
        this.errorMessage = err.error.message;
        this.list = [];
      }
    );
  }

  getLevels() {
    this._levelService.getLevels().subscribe(
      res => {
        if (!res.levels) {
          this.errorMessage = 'Error al obtener listado de evoluciones';
        } else {
          this.list = res.levels;
        }
      },
      err => {
        this.errorMessage = err.error.message;
        this.list = [];
      }
    );
  }

  getGoals() {
    this._goalService.getGoals().subscribe(
      res => {
        if (!res.goals) {
          this.errorMessage = 'Error al obtener listado de acciones';
        } else {
          this.list = res.goals;
        }
      },
      err => {
        this.errorMessage = err.error.message;
        this.list = [];
      }
    );
  }

  getLearnings() {
    this._learningService.getLearnings().subscribe(
      res => {
        if (!res.learnings) {
          this.errorMessage = 'Error al obtener listado de aprendizajes';
        } else {
          this.list = res.learnings;
        }
      },
      err => {
        this.errorMessage = err.error.message;
        this.list = [];
      }
    );
  }

  getActions() {
    this._actionService.getActions().subscribe(
      res => {
        if (!res.actions) {
          this.errorMessage = 'Error al obtener listado de acciones';          
        } else {
          this.list = res.actions;
        }
      },
      err => {
        this.errorMessage = err.error.message;
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
          this.errorMessage = 'Error al eliminar evolución';
        } else {          
          this.getEvolutions();
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  removeLevel(id) {
    this._levelService.removeLevel(id).subscribe(
      res => {
        if (!res.level) {
          this.errorMessage = 'Error al eliminar nivel';
        } else {          
          this.getLevels();
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  removeGoal(id) {
    this._goalService.removeGoal(id).subscribe(
      res => {
        if (!res.goal) {
          this.errorMessage = 'Error al eliminar objetivo';
        } else {          
          this.getGoals();
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  removeLearning(id) {
    this._learningService.removeLearning(id).subscribe(
      res => {
        if (!res.learning) {
          this.errorMessage = 'Error al eliminar aprendizaje';
        } else {          
          this.getLearnings();
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  removeAction(id) {
    this._actionService.removeAction(id).subscribe(
      res => {
        if (!res.action) {
          this.errorMessage = 'Error al eliminar acción';
        } else {          
          this.getActions();
        }
      },
      err => {
        this.errorMessage = err.error.message;
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
