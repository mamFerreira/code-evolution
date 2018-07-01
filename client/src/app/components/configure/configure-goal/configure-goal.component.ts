import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

import { AlertService } from '../../../services/alert.service';
import { UserService } from '../../../services/user.service';
import { GoalService } from '../../../services/goal.service';
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
  public isEdit: boolean;

  constructor(
    private _alertService: AlertService,
    private _userService: UserService,
    private _goalService: GoalService,
    private _route: ActivatedRoute
  ) { 
    this.title = 'Editar objetivo';
    this.identity = this._userService.getIdentity();
    this.isEdit = true;
  }

  ngOnInit() {

    this._route.params.forEach((params: Params) => {              
      if (params['id']) {
        this._goalService.getGoals(params['id']).subscribe(
          res => {
            if (!res.goals || res.goals.length === 0) {
              this._alertService.error(res.message); 
            } else {
              this.goal = res.goals[0];                    
            }
          },
          err => {
            this._alertService.error(err.error.message); 
          }
        );
      } else {
        this.isEdit = false;
        this.title = 'Añadir objetivo';
        this.goal = new Goal (null, '', '');
      }      
    });
  }


  onSubmit() {
    if (this.isEdit) {
      this._goalService.updateGoal(this.goal).subscribe(
        res => {
          if (!res.goal) {
            this._alertService.error(res.message); 
          } else {                    
            this._alertService.success('Objetivo actualizado correctamente');
          }
        },
        err => {
          this._alertService.error(err.error.message); 
        }
      ); 
    } else {      
      this._goalService.addGoal(this.goal).subscribe(
        res => {
          if (!res.goal) {
            this._alertService.error(res.message); 
          } else {        
            this._alertService.success('Objetivo creado correctamente');            
          }
        },
        err => {
          this._alertService.error(err.error.message);
        }
      ); 
    }  
  }

}
