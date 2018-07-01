import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Learning } from '../models/learning.model';
import { UserService } from './user.service';
import { Global } from './../enum/global';

@Injectable()
export class LearningService {

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

    // Añadir nuevo aprendizaje
    addLearning (learning_to_register: Learning): Observable<any> {
        let json = JSON.stringify(learning_to_register);
        return this._http.post(Global.url_api + 'learning-add', json, this.httpOptions);
    }

    // Obtener aprendizajes
    getLearnings(id: string = ''): Observable<any> {
        return this._http.get(Global.url_api + 'learnings-get/' + id, this.httpOptions);
    }

    // Actualizar aprendizaje
    updateLearning (learning_to_update: Learning): Observable<any> {
        let json = JSON.stringify(learning_to_update);
        return this._http.put(Global.url_api + 'learning-update/' + learning_to_update._id, json, this.httpOptions);
    }

    // Eliminar acción
    removeLearning (idLearning: string): Observable<any> {
        return this._http.delete(Global.url_api + 'learning-remove/' + idLearning, this.httpOptions);
    }

}
