import { Component, OnInit, ViewChild} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [AlertService, UserService]
})

export class LoginComponent implements OnInit {

  @ViewChild('formlogin') formlogin: NgForm;
  @ViewChild('formregister') formregister: NgForm;
  public user: User;

  constructor(
  private _router: Router,
  private _alertService: AlertService,
  private _userService: UserService
  ) {
  this.user = new User (null, '', '', 'admin@correo.com', '000', false, null, null, null);
  }

  ngOnInit() {}

  onSubmitLogin() {    
    this._userService.loginUser(this.user).subscribe(
      res => {
        if (!res.user) {          
          this._alertService.error(res.message);
        } else {
          // Almacenar en localstorage el usuario en sesión
          localStorage.setItem('identity', JSON.stringify(res.user));
          // Obtener token
          this._userService.loginUser(this.user, true).subscribe(
            res => {
              if (res.token < 1) {                
                this._alertService.error('Error en la generación del token');
              } else {
                localStorage.setItem('token', res.token);
                this.user = new User (null, '', '', '', '', false, null, null, null);
                this._router.navigate(['/']);
                location.reload();
              }
            },
            err => {                         
              this._alertService.error(err.error.message);
            }
          );
        }
      },
      err => {        
        this._alertService.error(err.error.message);
      }
    );
  }

  onSubmitRegister() {
    this.user.name = this.formregister.value.name_r;
    this.user.surname = this.formregister.value.surname_r;
    this.user.email = this.formregister.value.email_r;
    this.user.password = this.formregister.value.password_r;

    this._userService.addUser(this.user).subscribe(
      res => {
        if (!res.user) {          
          this._alertService.error(res.message);
        } else {
          this._alertService.success('Registro realizado correctamente. Identificate con ' + this.user.email);          
          this.user = new User (null, '', '', '', '', false, null, null, null);
          this.formregister.reset();
        }
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

}
