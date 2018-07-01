import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

import { AlertService } from '../../../services/alert.service';
import { UserService } from '../../../services/user.service';
import { LearningService } from '../../../services/learning.service';
import { Learning } from '../../../models/learning.model';

@Component({
  selector: 'app-configure-learning',
  templateUrl: './configure-learning.component.html',
  styleUrls: ['./configure-learning.component.css']
})
export class ConfigureLearningComponent implements OnInit {

  public title: string;
  public identity;
  public learning: Learning;  
  public isEdit: boolean;

  constructor(
    private _alertService: AlertService,
    private _userService: UserService,
    private _learningService: LearningService,
    private _route: ActivatedRoute    
  ) { 
    this.title = 'Editar aprendizaje';
    this.identity = this._userService.getIdentity();
    this.isEdit = true;
  }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {              
      if (params['id']) {
        this._learningService.getLearnings(params['id']).subscribe(
          res => {
            if (!res.learnings || res.learnings.length === 0) {
              this._alertService.error(res.message); 
            } else {
              this.learning = res.learnings[0];                      
            }
          },
          err => {
            this._alertService.error(err.error.message);
          }
        );
      } else {
        this.isEdit = false;
        this.title = 'Añadir aprendizaje';
        this.learning = new Learning (null, null, '', '', '', '');
      }      
    });
  }

  onSubmit() {
    if (this.isEdit) {      
      this._learningService.updateLearning(this.learning).subscribe(
        res => {
          if (!res.learning) {
            this._alertService.error(res.message); 
          } else {        
            this._alertService.success('Aprendizaje actualizado correctamente');
          }
        },
        err => {
          this._alertService.error(err.error.message);
        }
      ); 
    } else {      
      this._learningService.addLearning(this.learning).subscribe(
        res => {
          if (!res.learning) {
            this._alertService.error(res.message); 
          } else {        
            this._alertService.success('Aprendizaje creado correctamente');
          }
        },
        err => {
          this._alertService.error(err.error.message);
        }
      ); 
    }
  }

}
