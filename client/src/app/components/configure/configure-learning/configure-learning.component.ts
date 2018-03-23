import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

// Importar servicios
import { UserService } from '../../../services/user.service';
import { LearningService } from '../../../services/learning.service';
// Importar modelos
import { User } from '../../../models/user.model';
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
  public errorMessage: string;
  public successMessage: string;
  public boolEdit: boolean;

  constructor(
    private _userService: UserService,
    private _learningService: LearningService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { 
    this.title = 'Editar aprendizaje';
    this.identity = this._userService.getIdentity();
    this.errorMessage = '';  
    this.successMessage = '';
    this.boolEdit = true;
  }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {              
      if (params['id']) {
        this.getLearning(params['id']);
      } else {
        this.boolEdit = false;
        this.title = 'Añadir aprendizaje';
        this.learning = new Learning (null, '', '', '');
      }      
    });
  }

  getLearning (id) {    
    this._learningService.getLearning(id).subscribe(
      res => {
        if (!res.learning) {
          this.errorMessage = 'Error: No se ha podido obtener el aprendizaje deseado';
        } else {
          this.learning = res.learning;                      
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
      this._learningService.updateLearning(this.learning).subscribe(
        res => {
          if (!res.learning) {
            this.errorMessage = 'Error al actualizar aprendizaje: ' + res.message;
          } else {        
            this.successMessage = 'Aprendizaje actualizado correctamente';
          }
        },
        err => {
          this.errorMessage = err.error.message;
        }
      ); 
    } else {      
      this._learningService.addLearning(this.learning).subscribe(
        res => {
          if (!res.learning) {
            this.errorMessage = 'Error al crear aprendizaje: ' + res.message;
          } else {        
            this.successMessage = 'Aprendizaje creado correctamente';
          }
        },
        err => {
          this.errorMessage = err.error.message;
        }
      ); 
    }
  }

}
