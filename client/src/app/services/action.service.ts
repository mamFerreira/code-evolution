import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Action } from '../models/action.model';
import { UserService } from './user.service';
import { GlobalService } from './global.service';

@Injectable()
export class ActionService {

    private httpOptions;

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

    /**
    * OPERACIONES CRUD
    */

    // Añadir nueva acción en el sistema
    addAction (action_to_register: Action): Observable<any> {
        let json = JSON.stringify(action_to_register);
        return this._http.post(this._globalService.url + 'action-add', json, this.httpOptions);
    }

    // Obtener acción por ID
    getAction(id: string): Observable<any> {
        return this._http.get(this._globalService.url + 'action/' + id, this.httpOptions);
    }

    // Obtener todas las acción del sistema
    getActions(): Observable<any> {
        return this._http.get(this._globalService.url + 'actions/', this.httpOptions);
    }

    // Obtener todas las acciones asociadas a un nivel
    getActionsLevel(idLevel: number): Observable<any> {
        return this._http.get(this._globalService.url + 'actions/' + idLevel, this.httpOptions);
    }

    // Actualizar acción
    updateLevel (action_to_update: Action): Observable<any> {
        let json = JSON.stringify(action_to_update);
        return this._http.put(this._globalService.url + 'action-update/' + action_to_update._id, json, this.httpOptions);
    }

    // Eliminar acción
    removeAction (idAction: string): Observable<any> {
        return this._http.delete(this._globalService.url + 'action-remove/' + idAction, this.httpOptions);
    }

}
