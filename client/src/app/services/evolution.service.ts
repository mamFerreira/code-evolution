import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Evolution } from '../models/evolution.model';
import { UserService } from './user.service';
import { GLOBAL } from './../enum/global.enum';

@Injectable()
export class EvolutionService {

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

    // Operaciones CRUD

    // Añadir nueva evolución
    addEvolution (evolution_to_register: Evolution): Observable<any> {
        let json = JSON.stringify(evolution_to_register);
        return this._http.post(GLOBAL.URL_API + 'evolution-add', json, this.httpOptions);
    }

    // Obtener evoluciones
    getEvolutions(id: string = '', order: string = ''): Observable<any> {

        if (order.length > 0) {
            return this._http.get(GLOBAL.URL_API + 'evolutions-get-order/' + order, this.httpOptions);
        } else {
            return this._http.get(GLOBAL.URL_API + 'evolutions-get/' + id, this.httpOptions);
        }        
    }

    // Actualizar evolución
    updateEvolution (evol_to_update: Evolution): Observable<any> {
        let json = JSON.stringify(evol_to_update);
        return this._http.put(GLOBAL.URL_API + 'evolution-update/' + evol_to_update._id, json, this.httpOptions);
    }

    // Eliminar evolución
    removeEvolution (idEvolution: string): Observable<any> {
        return this._http.delete(GLOBAL.URL_API + 'evolution-remove/' + idEvolution, this.httpOptions);
    }

    /**
    * OPERACIONES ESPECIALES
    */

    // Obtener aprendizaje asociado
    getLernings(idEvolution: string): Observable<any> {
        return this._http.get(GLOBAL.URL_API + 'evolution-learning/' + idEvolution, this.httpOptions);
    }

    // Obtener acciones asociadas
    getActions(idEvolution: string): Observable<any> {
        return this._http.get(GLOBAL.URL_API + 'evolution-action/' + idEvolution, this.httpOptions);
    }     
    
}
