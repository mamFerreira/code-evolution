// Importación de los elementos empleados por el componente
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GLOBAL } from './services/global';
import { UserService } from './services/user.service';
import { User } from './models/user';

// Decorador para definir distintas propiedades del componente
// selector: Define la etiqueta html donde se renderiza el componente
// templateUrl: Archivo html con la vista del componente
// styleUrls: Archivo CSS con los estilos del componente
// providers: Servicios de los que depende el componente
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [UserService]
})
export class AppComponent implements OnInit{
  public title = 'CODE EVOLUTION';
  public user: User;
  public user_register: User;  
  public identity;
  public token;
  public sMsgRegister;
  public eMsgLogin;
  public eMsgRegister;
  public showRegisterForm;
  public url;

  constructor(    
    private _router: Router,
    private _userService: UserService
  ) {
    this.identity = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.user = new User ('', '', '', '', '', 'ROLE_USER', '', '');
    this.user_register = new User ('', '', '', '', '', 'ROLE_USER', '', '');
    this.url = GLOBAL.url;
  }

  ngOnInit() {
  }

  onSubmitLogin() {
    this._userService.loginUser(this.user).subscribe(
      response => {     

        this.identity = response.user;
        
        if (!this.identity._id) {
          this.eMsgLogin = 'El usuario no está correctamente identificado';
        } else {
          // Crear elemento en el localstorage para tener al usuario en sesión
          localStorage.setItem('identity', JSON.stringify(this.identity));

          // Conseguir el token para enviarselo a cada petición HTTP
          this._userService.loginUser(this.user, true).subscribe(
            response => {              
              this.token = response.token;
              if (this.token.length < 1) {
                this.eMsgLogin = 'Token no generado correctamente';
              } else {
                // Crear elemento en el localstorage para tener el token en sesión
                localStorage.setItem('token', this.token);
                this.eMsgLogin = '';
                this.user = new User ('', '', '', '', '', 'ROLE_USER', '', '');
                this._router.navigate(['home']);
              }
            },
            error => {
              let _error = <any> error;

              if (_error != null) {          
                this.eMsgLogin = JSON.parse(error._body).message;
                console.log(_error);
              }
            }
          );
        }

      },
      error => {
        let _error = <any> error;

        if (_error != null) {          
          this.eMsgLogin = JSON.parse(error._body).message;
          console.log(_error);
        }
      }
    );
  }

  onSubmitRegister() {

    this.sMsgRegister = '';
    this.eMsgRegister = '';

    this._userService.registerUser(this.user_register).subscribe(
      response => {
        let user = response.user;
        this.user_register = user;

        if (!user._id) {
          this.eMsgRegister = 'Error al registrarse';
        } else {
          this.sMsgRegister = 'Registro realizado correctamente, identificate con ' + this.user_register.email;
          this.user_register = new User ('', '', '', '', '', 'ROLE_USER', '', '');
        }
      },
      error => {
        let _error = <any> error;

        if (_error != null) {          
          this.eMsgRegister = JSON.parse(error._body).message;
          console.log(_error);
        }
      }
    );
  }

  logout() {
    localStorage.removeItem('identity');
    localStorage.removeItem('token');
    this.identity = null;
    this.token = null;  
    this._router.navigate(['/']);
  }

  showRegister() {    
    this.showRegisterForm = true;
  }
  
  hiddenRegister() {    
    this.showRegisterForm = false;
  }

}
