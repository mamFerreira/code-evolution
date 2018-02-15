import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

import { UserService } from './user.service';
import { GlobalService } from './global.service';

@Injectable()
export class EvolutionService {

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

    getEvolution(id: string): Observable<any> {
        return this._http.get(this._globalService.url + 'evolution/' + id, this.httpOptions);
    }

    getEvolutions(): Observable<any> {
        return this._http.get(this._globalService.url + 'evolutions', this.httpOptions);
    }

}
