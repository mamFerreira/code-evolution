import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { User } from '../models/user.model';
import { Global } from './../enum/global';

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
    return this._http.post(Global.url_api + 'user-add', json, this.httpOptions);
  }

  // Logueo de usuario
  loginUser (user_to_login: User, gethash = null): Observable<any> {
    if ( gethash != null ) {
      user_to_login.gethash = gethash;
    }
    let json = JSON.stringify(user_to_login);

    return this._http.post(Global.url_api + 'user-login', json, httpOptions);
  }

  // Comprobar la validez del token almacenado en el localStorage
  checkToken(): Observable<any> {
    return this._http.get(Global.url_api + 'user-check-token', this.httpOptionsToken);
  }

  // Obtener usuarios registrados
  getUser (idUser: string): Observable<any> {    
    return this._http.get(Global.url_api + 'user/' + idUser, this.httpOptionsToken);
  }

  // Obtener usuarios registrados
  getUsers (): Observable<any> {    
    return this._http.get(Global.url_api + 'users', this.httpOptionsToken);
  }

  // Actualizar usuario (solo administrador)
  updateUserById (user_to_update: User): Observable<any> {
    let json = JSON.stringify(user_to_update);
    return this._http.put(Global.url_api + 'user-update/' + user_to_update._id, json, this.httpOptionsToken);
  }

  // Actualizar su propio usuario
  updateUser (user_to_update: User): Observable<any> {
    let json = JSON.stringify(user_to_update);
    return this._http.put(Global.url_api + 'user-update', json, this.httpOptionsToken);
  }

  // Eliminar usuario
  removeUser (idUser: string): Observable<any> {
    return this._http.delete(Global.url_api + 'user-remove/' + idUser, this.httpOptionsToken);
  }

  // Activar usuario
  activateUser (idUser: string): Observable<any> {
    return this._http.get(Global.url_api + 'user-activate/' + idUser, this.httpOptionsToken);
  }

  // Desactivar usuario
  desactivateUser (idUser: string): Observable<any> {
    return this._http.get(Global.url_api + 'user-desactivate/' + idUser, this.httpOptionsToken);
  }

  // Obtener token del local storage
  getToken() {
    let token = localStorage.getItem('token');

    if (token === 'undefined') {
        token = null;
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

}
