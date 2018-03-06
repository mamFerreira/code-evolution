import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

import { UserService } from './user.service';
import { GlobalService } from './global.service';

@Injectable()
export class LevelService {

  public httpOptions;

  constructor(
      private _http: HttpClient,
      private _globalService: GlobalService,
      private _userService: UserService
  ) {

      this.httpOptions = {
          headers: new HttpHeaders({
            'Content-Type':  'application/json',
            'Authorization': _userService.getToken()
          })
        };
  }

  getLevel(id: string): Observable<any> {
      return this._http.get(this._globalService.url + 'level/' + id, this.httpOptions);
  }

  getLevels(evolution: string): Observable<any> {
      return this._http.get(this._globalService.url + 'levels/' + evolution, this.httpOptions);
  }

  translateCode(code: string): Observable<any> {
    let json = JSON.stringify({code});
    return this._http.post(this._globalService.url + 'translate', json, this.httpOptions);
  }

}
