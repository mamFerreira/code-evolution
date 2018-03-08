import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

// Importar servicios
import { UserService } from '../../../services/user.service';
import { LevelService } from '../../../services/level.service';
// Importar modelos
import { User } from '../../../models/user.model';
import { Level } from '../../../models/level.model';

@Component({
  selector: 'app-configure-user',
  templateUrl: './configure-user.component.html',
  styleUrls: ['./configure-user.component.css']
})
export class ConfigureUserComponent implements OnInit {

  public title: string;
  public identity;
  public user: User;
  public levels: Level[];
  public roles: string[];
  public errorMessage: string;
  public successMessage: string;   

  constructor(
    private _userService: UserService,
    private _levelService: LevelService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { 
    this.title = 'Editar usuario';
    this.identity = this._userService.getIdentity();
    this.errorMessage = '';  
    this.successMessage = '';
    this.roles = ['ROLE_USER', 'ROLE_ADMIN'];
  }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {
      let id = params['id'];

      this._userService.getUser(id).subscribe(
        res => {
          if (!res.user) {
            this.errorMessage = 'Error: No se ha podido obtener el usuario deseado';
          } else {
            this.user = res.user;                      
          }
        },
        err => {
          this.errorMessage = err.error.message;
        }
      );
    });

    this.getLevels();
  }

  getLevels() {
    this._levelService.getLevels().subscribe(
      res => {
        if (!res.levels) {
          this.errorMessage = 'Error: No se ha podido obtener el listado de niveles';
        } else {
          this.levels = res.levels;
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  activateUser() {
    this._userService.activateUser(this.user._id).subscribe(
      res => {
        if (!res.user) {
          this.errorMessage = 'No se ha podido activar el usuario';
        } else {
          this.user.active = 1;                  
        }
      },
      err => {
        this.errorMessage = 'err.error.message';
      }
    );
  }

  desactivateUser() {
    this._userService.desactivateUser(this.user._id).subscribe(
      res => {
        if (!res.user) {
          this.errorMessage = 'No se ha podido desactivar el usuario';
        } else {
          this.user.active = 0;                  
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
    this._userService.updateUserById(this.user).subscribe(
      res => {
        if (!res.user) {
          this.errorMessage = 'Error al actualizar el usuario: ' + res.message;
        } else {        
          this.successMessage = 'Usuario actualizado correctamente';
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );    
  }

}
