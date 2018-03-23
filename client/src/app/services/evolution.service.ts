import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Evolution } from '../models/evolution.model';
import { UserService } from './user.service';
import { GlobalService } from './global.service';

@Injectable()
export class EvolutionService {

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

    // Añadir nueva evolución en el sistema
    addEvolution (evolution_to_register: Evolution): Observable<any> {
        let json = JSON.stringify(evolution_to_register);
        return this._http.post(this._globalService.url + 'evolution-add', json, this.httpOptions);
    }

    // Obtener evolución por ID
    getEvolution(id: string): Observable<any> {
        return this._http.get(this._globalService.url + 'evolution/' + id, this.httpOptions);
    }

    // Obtener todas las evoluciones del sistema donde el usuario tiene permisos de visualización
    getEvolutions(): Observable<any> {
        return this._http.get(this._globalService.url + 'evolutions/', this.httpOptions);
    }

    // Obtener el numero de evoluciones registradas en el sistema
    getNumEvolutions(): Observable<any> {
        return this._http.get(this._globalService.url + 'evolutions-num/', this.httpOptions);
    }

    // Actualizar evolución
    updateEvolution (evol_to_update: Evolution): Observable<any> {
        let json = JSON.stringify(evol_to_update);
        return this._http.put(this._globalService.url + 'evolution-update/' + evol_to_update._id, json, this.httpOptions);
    }

    // Eliminar evolución
    removeEvolution (idEvolution: string): Observable<any> {
        return this._http.delete(this._globalService.url + 'evolution-remove/' + idEvolution, this.httpOptions);
    }

    /**
    * OPERACIONES ESPECIALES
    */

    // Obtener el número de niveles de la evolución
    getEvolutionNumLevels(idEvolution: string): Observable<any> {
        return this._http.get(this._globalService.url + 'evolution-num-levels/' + idEvolution, this.httpOptions);
    }

    // Obtener el listado de aprendizaje asociado a la evolución
    getEvolutionLearnings(idEvolution: string): Observable<any> {
        return this._http.get(this._globalService.url + 'evolution-learning/' + idEvolution, this.httpOptions);
    }

    // Obtener el listado de acciones asociada a la evolución
    getEvolutionActions(idEvolution: string): Observable<any> {
        return this._http.get(this._globalService.url + 'evolution-action/' + idEvolution, this.httpOptions);
    }

     

}
