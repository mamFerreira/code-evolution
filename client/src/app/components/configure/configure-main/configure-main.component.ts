import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Importar servicios
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
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _goalService: GoalService,
    private _learningService: LearningService,
    private _actionService: ActionService,
    private _router: Router
  ) { 
    this.title = 'Menú configuración';
    this.identity = this._userService.getIdentity();
    this.option = '';    
  }

  ngOnInit() {
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

  addElement() {

    switch (this.option) {
      case 'evolution':
        this._router.navigate(['/admin/addEvolution']);
        break;
      case 'level':
        this._router.navigate(['/admin/addLevel']);
        break;
      case 'goal':
        this._router.navigate(['/admin/addGoal']);
        break;
      case 'learning':
        this._router.navigate(['/admin/addLearning']);
        break;
      case 'action':
        this._router.navigate(['/admin/addAction']);
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
          this.errorMessage = 'Error al obtener listado de usuarios';
        } else {
          this.list = res.users;
        }
      },
      err => {
        this.errorMessage = err.error.message;
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
          this.errorMessage = 'Error al eliminar el usuario';
        } else {          
          this.getUsers();
        }
      },
      err => {
        this.errorMessage = err.error.message;
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
}
