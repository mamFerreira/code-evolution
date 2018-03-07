import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

import { User } from '../models/user.model';
import { GlobalService } from './global.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable()
export class UserService {

  constructor(
    private _http: HttpClient,
    private _globalService: GlobalService
  ) { }

  loginUser (user_to_login: User, gethash = null): Observable<any> {
    if ( gethash != null ) {
      user_to_login.gethash = gethash;
    }
    let json = JSON.stringify(user_to_login);

    return this._http.post(this._globalService.url + 'user-login', json, httpOptions);
  }

  registerUser (user_to_register: User): Observable<any> {
    let json = JSON.stringify(user_to_register);
    return this._http.post(this._globalService.url + 'user-add', json, httpOptions);
  }

  updateUser (user_to_update: User): Observable<any> {
    let json = JSON.stringify(user_to_update);
    let httpOptionsAuth = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': this.getToken()
      })
    };

    return this._http.put(this._globalService.url + 'user-update', json, httpOptionsAuth);
  }

  getToken() {
    let token = localStorage.getItem('token');

    if (token === 'undefined') {
        token = null;
    }
    return token;
  }

  checkToken(): Observable<any> {

    let httpOptionsAuth = {
      headers: new HttpHeaders({
        'Content-Type':  'application/json',
        'Authorization': this.getToken()
      })
    };

    return this._http.get(this._globalService.url + 'user-check-token', httpOptionsAuth);
  }

  getIdentity() {
    let identity = JSON.parse(localStorage.getItem('identity'));

    if (identity === 'undefined') {
      identity = null;
    }
    return identity;
  }

}
