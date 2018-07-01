import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Goal } from '../models/goal.model';
import { UserService } from './user.service';
import { Global } from './../enum/global';

@Injectable()
export class GoalService {

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

    // Añadir nuevo objetivo
    addGoal (goal_to_register: Goal): Observable<any> {
        let json = JSON.stringify(goal_to_register);
        return this._http.post(Global.url_api + 'goal-add', json, this.httpOptions);
    }

    // Obtener objetivos
    getGoals(id: string = ''): Observable<any> {
        return this._http.get(Global.url_api + 'goals-get/' + id, this.httpOptions);
    }

    // Actualizar objetivo
    updateGoal (goal_to_update: Goal): Observable<any> {
        let json = JSON.stringify(goal_to_update);
        return this._http.put(Global.url_api + 'goal-update/' + goal_to_update._id, json, this.httpOptions);
    }

    // Eliminar objetivo
    removeGoal (idGoal: string): Observable<any> {
        return this._http.delete(Global.url_api + 'goal-remove/' + idGoal, this.httpOptions);
    }

}
