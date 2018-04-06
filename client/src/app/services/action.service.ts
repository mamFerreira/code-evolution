import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Action } from '../models/action.model';
import { UserService } from './user.service';
import { Global } from './../enum/global';

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
              'Authorization': _userService.getToken()
            })
          };
    }

    /**
    * OPERACIONES CRUD
    */

    // Añadir nueva acción en el sistema
    addAction (action_to_register: Action): Observable<any> {
        let json = JSON.stringify(action_to_register);
        return this._http.post(Global.url_api + 'action-add', json, this.httpOptions);
    }

    // Obtener acción por ID
    getAction(id: string): Observable<any> {
        return this._http.get(Global.url_api + 'action/' + id, this.httpOptions);
    }

    // Obtener todas las acción del sistema
    getActions(): Observable<any> {
        return this._http.get(Global.url_api + 'actions/', this.httpOptions);
    }

    // Obtener todas las acciones asociadas a un nivel
    getActionsLevel(idLevel: string): Observable<any> {
        return this._http.get(Global.url_api + 'actions/' + idLevel, this.httpOptions);
    }

    // Actualizar acción
    updateAction (action_to_update: Action): Observable<any> {
        let json = JSON.stringify(action_to_update);
        return this._http.put(Global.url_api + 'action-update/' + action_to_update._id, json, this.httpOptions);
    }

    // Eliminar acción
    removeAction (idAction: string): Observable<any> {
        return this._http.delete(Global.url_api + 'action-remove/' + idAction, this.httpOptions);
    }

}
