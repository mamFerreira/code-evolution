import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { User } from '../models/user.model';
import { GLOBAL } from './../enum/global.enum';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable()
export class UserService {

  private httpOptions;
  private httpOptionsToken;

  constructor(
    private _http: HttpClient
  ) {

    this.httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json'
      })
    };

    this.httpOptionsToken = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': this.getToken()
      })
    };
  }

  // Registro de nuevo usuario en el sistema
  addUser (user_to_register: User): Observable<any> {
    let json = JSON.stringify(user_to_register);
    return this._http.post(GLOBAL.URL_API + 'user-add', json, this.httpOptions);
  }

  // Obtener usuario por ID
  getUser (idUser: string): Observable<any> {    
    return this._http.get(GLOBAL.URL_API + 'users-get/' + idUser, this.httpOptionsToken);
  }

  // Obtener usuarios registrados
  getUsers (): Observable<any> {    
    return this._http.get(GLOBAL.URL_API + 'users-get', this.httpOptionsToken);
  }

  // Actualizar usuario (solo administrador)
  updateUserById (user_to_update: User): Observable<any> {
    let json = JSON.stringify(user_to_update);
    return this._http.put(GLOBAL.URL_API + 'user-update/' + user_to_update._id, json, this.httpOptionsToken);
  }

  // Actualizar su propio usuario
  updateUser (user_to_update: User): Observable<any> {
    let json = JSON.stringify(user_to_update);
    return this._http.put(GLOBAL.URL_API + 'user-update', json, this.httpOptionsToken);
  }

  // Eliminar usuario
  removeUser (idUser: string): Observable<any> {
    return this._http.delete(GLOBAL.URL_API + 'user-remove/' + idUser, this.httpOptionsToken);
  }

  // Obtener token del local storage
  getToken() {
    let token = localStorage.getItem('token');
        
    if (token === 'undefined' || token === null) {        
        token = '';
    }

    return token;
  }

  // Obtener identidad del local storage
  getIdentity() {
    let identity = JSON.parse(localStorage.getItem('identity'));

    if (identity === 'undefined') {
      identity = null;
    }
    return identity;
  }

  // Logueo de usuario
  loginUser (user_to_login: User, gethash = null): Observable<any> {
    if ( gethash != null ) {
      user_to_login.gethash = gethash;
    }
    let json = JSON.stringify(user_to_login);

    return this._http.post(GLOBAL.URL_API + 'user-login', json, httpOptions);
  }
  
  // Comprobar la validez del token almacenado en el localStorage
  checkToken(): Observable<any> {        
    return this._http.get(GLOBAL.URL_API + 'user-check-token', this.httpOptionsToken);
  }

}
