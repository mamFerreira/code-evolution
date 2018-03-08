import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

// Importar servicios
import { UserService } from '../../../services/user.service';
import { GoalService } from '../../../services/goal.service';
// Importar modelos
import { User } from '../../../models/user.model';
import { Goal } from '../../../models/goal.model';


@Component({
  selector: 'app-configure-goal',
  templateUrl: './configure-goal.component.html',
  styleUrls: ['./configure-goal.component.css']
})
export class ConfigureGoalComponent implements OnInit {

  public title: string;
  public identity;
  public goal: Goal;
  public errorMessage: string;
  public successMessage: string;
  public boolEdit: boolean;

  constructor(
    private _userService: UserService,
    private _goalService: GoalService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { 
    this.title = 'Editar objetivo';
    this.identity = this._userService.getIdentity();
    this.errorMessage = '';  
    this.successMessage = '';
    this.boolEdit = true;
  }

  ngOnInit() {

    this._route.params.forEach((params: Params) => {              
      if (params['id']) {
        this.getGoal(params['id']);
      } else {
        this.boolEdit = false;
        this.title = 'Añadir objetivo';
        this.goal = new Goal (null, '');
      }      
    });
  }


  getGoal (id) {    
      this._goalService.getGoal(id).subscribe(
        res => {
          if (!res.goal) {
            this.errorMessage = 'Error: No se ha podido obtener el objetivo deseado';
          } else {
            this.goal = res.goal;                      
          }
        },
        err => {
          this.errorMessage = err.error.message;
        }
      );
  }


  onSubmit() {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.boolEdit) {
      this._goalService.updateGoal(this.goal).subscribe(
        res => {
          if (!res.goal) {
            this.errorMessage = 'Error al actualizar objetivo: ' + res.message;
          } else {        
            this.successMessage = 'Objetivo actualizado correctamente';
          }
        },
        err => {
          this.errorMessage = err.error.message;
        }
      ); 
    } else {
      console.log('Añadir');
      this._goalService.addGoal(this.goal).subscribe(
        res => {
          if (!res.goal) {
            this.errorMessage = 'Error al crear objetivo: ' + res.message;
          } else {        
            this.successMessage = 'Objetivo creado correctamente';
          }
        },
        err => {
          this.errorMessage = err.error.message;
        }
      ); 
    }  
  }

}
