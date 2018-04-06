import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Observable} from 'rxjs/Observable';

import { Level } from '../models/level.model';
import { Position } from '../models/position.model';
import { LevelGoal } from '../models/level_goal.model';
import { LevelLearning } from '../models/level_learning.model';
import { LevelAction } from '../models/level_action.model';

import { UserService } from './user.service';
import { Global } from './../enum/global';

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

  // Añadir nuevo nivel en el sistema
  addLevel (level_to_register: Level): Observable<any> {
    let json = JSON.stringify(level_to_register);
    return this._http.post(Global.url_api + 'level-add', json, this.httpOptions);
  }

  // Obtener nivel por ID
  getLevel(id: string): Observable<any> {
      return this._http.get(Global.url_api + 'level/' + id, this.httpOptions);
  }

  // Obtener todos los nivel del sistema
  getLevels(): Observable<any> {
      return this._http.get(Global.url_api + 'levels/', this.httpOptions);
  }

  // Obtener todos los nivel asociadas a una evolución
  getLevelsEvolution(idEvolution: string): Observable<any> {
      return this._http.get(Global.url_api + 'levels/' + idEvolution, this.httpOptions);
  }

  // Actualizar nivel
  updateLevel (level_to_register: Level): Observable<any> {
      let json = JSON.stringify(level_to_register);
      return this._http.put(Global.url_api + 'level-update/' + level_to_register._id, json, this.httpOptions);
  }

  // Eliminar nivel
  removeLevel (idLearn: string): Observable<any> {
      return this._http.delete(Global.url_api + 'level-remove/' + idLearn, this.httpOptions);
  }


  /**
   * Operaciones especiales
   */

  // Activar nivel
  activateLevel (idLevel: string): Observable<any> {
    return this._http.get(Global.url_api + 'level-active/' + idLevel, this.httpOptions);
  }

  // Desactivar nivel
  desactivateLevel (idLevel: string): Observable<any> {
    return this._http.get(Global.url_api + 'level-desactive/' + idLevel, this.httpOptions);
  }

  // Registrar código Python
  registerCode(code: string, idLevel: string): Observable<any> {
    let json = JSON.stringify({code});
    return this._http.post(Global.url_api + 'level-register-code/' + idLevel, json, this.httpOptions);
  }

  // Cargar código del nivel
  loadCode (idLevel: string): Observable<any> {
    return this._http.get(Global.url_api + 'level-load-code/' + idLevel, this.httpOptions);
  }

  // Avanzar al siguiente nivel
  nextLevel (idLevel: string): Observable<any> {
    return this._http.get(Global.url_api + 'level-next/' + idLevel, this.httpOptions);
  }

  /**
   * Operaciones de edición
   */

  // Añadir posición al nivel
  addPosition (pos_to_register: Position, idLevel: string): Observable<any> {
    let json = JSON.stringify(pos_to_register);
    return this._http.post(Global.url_api + 'position-add/' + idLevel, json, this.httpOptions);
  }

  // Obtener todas las posiciones asociadas al nivel
  getPositions(idLevel: string): Observable<any> {
    return this._http.get(Global.url_api + 'positions/' + idLevel, this.httpOptions);
  }

  // Eliminar posición del nivel
  removePosition (idPosition: string): Observable<any> {
    return this._http.delete(Global.url_api + 'position-remove/' + idPosition, this.httpOptions);
  }

  // Añadir objetivo al nivel
  addGoalLevel (level_goal_to_register: LevelGoal): Observable<any> {
    let json = JSON.stringify(level_goal_to_register);
    return this._http.post(Global.url_api + 'level-goal-add', json, this.httpOptions);
  }

  // Eliminar objetivo del nivel
  removeGoalLevel (idLevelGoal: string): Observable<any> {
    return this._http.delete(Global.url_api + 'level-goal-remove/' + idLevelGoal, this.httpOptions);
  }

  // Añadir aprendizaje al nivel
  addLearningLevel (level_learning_to_register: LevelLearning): Observable<any> {
    let json = JSON.stringify(level_learning_to_register);
    return this._http.post(Global.url_api + 'level-learning-add', json, this.httpOptions);
  }

  // Eliminar aprendizaje del nivel
  removeLearningLevel (idLevelLearning: string): Observable<any> {
    return this._http.delete(Global.url_api + 'level-learning-remove/' + idLevelLearning, this.httpOptions);
  }

  // Añadir acción al nivel
  addActionLevel (level_action_to_register: LevelAction): Observable<any> {
    let json = JSON.stringify(level_action_to_register);
    return this._http.post(Global.url_api + 'level-action-add', json, this.httpOptions);
  }

  // Eliminar acción del nivel
  removeActionLevel (idLevelAction: string): Observable<any> {
    return this._http.delete(Global.url_api + 'level-action-remove/' + idLevelAction, this.httpOptions);
  }


}
