import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { Game } from '../models/game.model';
import { UserService } from './user.service';
import { GLOBAL } from './../enum/global.enum';

@Injectable()
export class GameService {

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

    // Registrar Partida
    registerGame (game_to_register: Game): Observable<any> {
        let json = JSON.stringify(game_to_register);
        return this._http.post(GLOBAL.URL_API + 'game-register', json, this.httpOptions);
    }

    // Obtener partida
    getGame(userID: string, levelID: string): Observable<any> {        
        return this._http.get(GLOBAL.URL_API + 'games-get/' + userID + '/' + levelID, this.httpOptions);
    }    

    // Eliminar partida
    removeGame (idGame: string): Observable<any> {
        return this._http.delete(GLOBAL.URL_API + 'game-remove/' + idGame, this.httpOptions);
    }

}
