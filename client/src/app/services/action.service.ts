import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Action } from '../models/action.model';
import { UserService } from './user.service';
import { GLOBAL } from './../enum/global.enum';

@Injectable()
export class ActionService {

    private httpOptions;

    constructor(
        private _http: HttpClient,        
        private _userService: UserService
    ) {

        this.httpOptions = {
            headers: new HttpHeaders({
              'Content-Type':  'application/json',
              'Authorization': this._userService.getToken()
            })
          };
    }

    // Añadir nueva acción
    addAction (action_to_register: Action): Observable<any> {
        let json = JSON.stringify(action_to_register);
        return this._http.post(GLOBAL.URL_API + 'action-add', json, this.httpOptions);
    }

    // Obtener acciones
    getActions(id: string = ''): Observable<any> {
        return this._http.get(GLOBAL.URL_API + 'actions-get/' + id, this.httpOptions);
    }

    // Actualizar acción
    updateAction (action_to_update: Action): Observable<any> {
        let json = JSON.stringify(action_to_update);
        return this._http.put(GLOBAL.URL_API + 'action-update/' + action_to_update._id, json, this.httpOptions);
    }

    // Eliminar acción
    removeAction (idAction: string): Observable<any> {
        return this._http.delete(GLOBAL.URL_API + 'action-remove/' + idAction, this.httpOptions);
    }

}
