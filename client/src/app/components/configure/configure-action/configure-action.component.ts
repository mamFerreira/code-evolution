import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

// Importar servicios
import { UserService } from '../../../services/user.service';
import { ActionService } from '../../../services/action.service';
// Importar modelos
import { User } from '../../../models/user.model';
import { Action } from '../../../models/action.model';

@Component({
  selector: 'app-configure-action',
  templateUrl: './configure-action.component.html',
  styleUrls: ['./configure-action.component.css']
})
export class ConfigureActionComponent implements OnInit {

  public title: string;
  public identity;
  public action: Action;
  public errorMessage: string;
  public successMessage: string;
  public boolEdit: boolean;

  constructor(
    private _userService: UserService,
    private _actionService: ActionService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { 
    this.title = 'Editar acción';
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
        this.title = 'Añadir acción';
        this.action = new Action (null, '', '', '');
      }      
    });
  }


  getGoal (id) {    
      this._actionService.getAction(id).subscribe(
        res => {
          if (!res.action) {
            this.errorMessage = 'Error: No se ha podido obtener la acción deseada';
          } else {
            this.action = res.action;                      
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
      this._actionService.updateAction(this.action).subscribe(
        res => {
          if (!res.action) {
            this.errorMessage = 'Error al actualizar acción: ' + res.message;
          } else {        
            this.successMessage = 'Acción actualizada correctamente';
          }
        },
        err => {
          this.errorMessage = err.error.message;
        }
      ); 
    } else {      
      this._actionService.addAction(this.action).subscribe(
        res => {
          if (!res.action) {
            this.errorMessage = 'Error al crear acción: ' + res.message;
          } else {        
            this.successMessage = 'Acción creada correctamente';
          }
        },
        err => {
          this.errorMessage = err.error.message;
        }
      ); 
    }  
  }

}
