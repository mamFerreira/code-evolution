import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Learning } from '../models/learning.model';
import { UserService } from './user.service';
import { GlobalService } from './global.service';

@Injectable()
export class LearningService {

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

    // Añadir nuevo aprendizaje en el sistema
    addLearning (learn_to_register: Learning): Observable<any> {
        let json = JSON.stringify(learn_to_register);
        return this._http.post(this._globalService.url + 'learning-add', json, this.httpOptions);
    }

    // Obtener aprendizaje por ID
    getLearning(id: string): Observable<any> {
        return this._http.get(this._globalService.url + 'learning/' + id, this.httpOptions);
    }

    // Obtener todos los aprendizaje del sistema
    getLearnings(): Observable<any> {
        return this._http.get(this._globalService.url + 'learnings/', this.httpOptions);
    }

    // Obtener todos los aprendizaje asociadas a un nivel
    getLearningsLevel(idLevel: string): Observable<any> {
        return this._http.get(this._globalService.url + 'learnings/' + idLevel, this.httpOptions);
    }

    // Actualizar aprendizaje
    updateLearning (learn_to_register: Learning): Observable<any> {
        let json = JSON.stringify(learn_to_register);
        return this._http.put(this._globalService.url + 'learning-update/' + learn_to_register._id, json, this.httpOptions);
    }

    // Eliminar aprendizaje
    removeLearning (idLearn: string): Observable<any> {
        return this._http.delete(this._globalService.url + 'learning-remove/' + idLearn, this.httpOptions);
    }

}