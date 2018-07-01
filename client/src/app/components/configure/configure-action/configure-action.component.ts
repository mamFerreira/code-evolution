import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';


import { AlertService } from '../../../services/alert.service';
import { UserService } from '../../../services/user.service';
import { ActionService } from '../../../services/action.service';
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
  public isEdit: boolean;

  constructor(
    private _alertService: AlertService,
    private _userService: UserService,
    private _actionService: ActionService,
    private _route: ActivatedRoute    
  ) { 
    this.title = 'Editar acción';
    this.identity = this._userService.getIdentity();    
    this.isEdit = true;
  }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {              
      if (params['id']) {
        this._actionService.getActions(params['id']).subscribe(
          res => {
            if (!res.actions || res.actions.length === 0) {
              this._alertService.error(res.message); 
            } else {
              this.action = res.actions[0];                      
            }
          },
          err => {
            this._alertService.error(err.error.message);
          }
        );
      } else {
        this.isEdit = false;
        this.title = 'Añadir acción';
        this.action = new Action (null, null, '', '', '', '');
      }      
    });
  }


  onSubmit() {
    if (this.isEdit) {
      this._actionService.updateAction(this.action).subscribe(
        res => {
          if (!res.action) {
            this._alertService.error(res.message); 
          } else {                    
            this._alertService.success('Acción actualizada correctamente');
          }
        },
        err => {
          this._alertService.error(err.error.message);
        }
      ); 
    } else {      
      this._actionService.addAction(this.action).subscribe(
        res => {
          if (!res.action) {
            this._alertService.error(res.message); 
          } else {                    
            this._alertService.success('Acción creada correctamente');
          }
        },
        err => {
          this._alertService.error(err.error.message);
        }
      ); 
    }  
  }

}
