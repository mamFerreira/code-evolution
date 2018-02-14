import { Component, OnInit, ViewChild} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [UserService]
})

export class LoginComponent implements OnInit {
  @ViewChild('formlogin') formlogin: NgForm;
  @ViewChild('formregister') formregister: NgForm;
  public user: User;
  public successRegister: String;
  public errorRegister: String;
  public errorLogin: String;
  public showRegisterForm;

  constructor(
    private _router: Router,
    private _userService: UserService
  ) {
    this.user = new User ('', '', '', '', '', 'ROLE_USER', '', '', null);
    this.showRegisterForm = false;
  }

  ngOnInit() {}

  onSubmitLogin() {
    this.user.email = this.formlogin.value.email;
    this.user.password = this.formlogin.value.password;
    this._userService.loginUser(this.user).subscribe(
      res => {
        if (!res.user._id) {
          this.errorLogin = 'Identificación del usuario realizada sin éxito';
        } else {
          // Almacenar en localstorage el usuario en sesión
          localStorage.setItem('identity', JSON.stringify(res.user));
          // Obtener token
          this._userService.loginUser(this.user, true).subscribe(
            res => {
              if (res.token < 1) {
                this.errorLogin = 'Error en la generación del token';
              } else {
                localStorage.setItem('token', res.token);
                this.user = new User ('', '', '', '', '', 'ROLE_USER', '', '', null);
                this._router.navigate(['/']);
                window.location.reload();
              }
            },
            err => {
              this.errorLogin = err.error.message;
            }
          );
        }
      },
      err => {
        this.errorLogin = err.error.message;
      }
    );
  }

  onSubmitRegister() {
    this.user.name = this.formregister.value.name_r;
    this.user.surname = this.formregister.value.surname_r;
    this.user.email = this.formregister.value.email_r;
    this.user.password = this.formregister.value.password_r;
    this.successRegister = '';
    this.errorRegister = '';

    this._userService.registerUser(this.user).subscribe(
      res => {
        if (!res.user._id) {
          this.errorRegister = 'Error al registrarse';
        } else {
          this.successRegister = 'Registro realizado correctamente, identificate con ' + this.user.email;
          this.user = new User ('', '', '', '', '', 'ROLE_USER', '', '', null);
          this.formregister.reset();
        }
      },
      err => {
        this.errorRegister = err.error.message;
      }
    );
  }

}
