import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

import { Level } from '../models/level.model';
import { LevelGoal } from '../models/level_goal.model';
import { UserService } from './user.service';
import { GLOBAL } from './../enum/global.enum';

@Injectable()
export class LevelService {

  public httpOptions;

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
   * Operaciones CRUD
   */

  // Añadir nuevo nivel
  addLevel (level_to_register: Level): Observable<any> {
    let json = JSON.stringify(level_to_register);
    return this._http.post(GLOBAL.URL_API + 'level-add', json, this.httpOptions);
  }

  // Obtener niveles
  getLevels(id: string = ''): Observable<any> {    
      return this._http.get(GLOBAL.URL_API + 'levels-get/' + id, this.httpOptions);
  }

  // Obtener niveles por evolución
  getLevelsEvolution(idEvolution: string, order: string = ''): Observable<any> {          
      return this._http.get(GLOBAL.URL_API + 'levels-evolution-get/' + idEvolution + '/' + order, this.httpOptions);
  }

  // Actualizar nivel
  updateLevel (level_to_register: Level): Observable<any> {
      let json = JSON.stringify(level_to_register);
      return this._http.put(GLOBAL.URL_API + 'level-update/' + level_to_register._id, json, this.httpOptions);
  }

  // Eliminar nivel
  removeLevel (idLevel: string): Observable<any> {
      return this._http.delete(GLOBAL.URL_API + 'level-remove/' + idLevel, this.httpOptions);
  }

  // Obtener código por defecto del nivel
  getCode(idLevel: string): Observable<any> {    
    return this._http.get(GLOBAL.URL_API + 'level-load-code/' + idLevel, this.httpOptions);
  }

  /**
   * Operaciones de edición
  */
  
  addAction (idLevel: string, idAction: string): Observable<any> {
    let json = {'levelID': idLevel, 'actionID': idAction};
    return this._http.post(GLOBAL.URL_API + 'level-action-add', json, this.httpOptions);
  }

  getActions(idLevel: string): Observable<any> {    
    return this._http.get(GLOBAL.URL_API + 'level-actions-get/' + idLevel, this.httpOptions);
  }

  removeAction (idLevel: string, idAction: string): Observable<any> {
    return this._http.delete(GLOBAL.URL_API + 'level-action-remove/' + idLevel + '/' + idAction, this.httpOptions);
  }

  addLearning (idLevel: string, idLearning: string): Observable<any> {
    let json = {'levelID': idLevel, 'learningID': idLearning};
    return this._http.post(GLOBAL.URL_API + 'level-learning-add', json, this.httpOptions);
  }

  getLearnings(idLevel: string): Observable<any> {    
    return this._http.get(GLOBAL.URL_API + 'level-learnings-get/' + idLevel, this.httpOptions);
  }

  removeLearning (idLevel: string, idLearning: string): Observable<any> {
    return this._http.delete(GLOBAL.URL_API + 'level-learning-remove/' + idLevel + '/' + idLearning, this.httpOptions);
  }

  addGoal (level_goal: LevelGoal): Observable<any> {
    let json = JSON.stringify(level_goal);
    return this._http.post(GLOBAL.URL_API + 'level-goal-add', json, this.httpOptions);
  }

  getGoals(idLevel: string): Observable<any> {    
    return this._http.get(GLOBAL.URL_API + 'level-goals-get/' + idLevel, this.httpOptions);
  }

  removeGoal (idLevel: string, idGoal: string): Observable<any> {
    return this._http.delete(GLOBAL.URL_API + 'level-goal-remove/' + idLevel + '/' + idGoal, this.httpOptions);
  }

}
