import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';

@Injectable()
export class LevelService {
    
    public url: string;

    constructor (private _http: Http) {
        this.url = GLOBAL.url;
    }

    getLevels (token, evolutionId = null) {
        let headers = new Headers({
            'Content-Type' : 'application/json',
            'Authorization': token
        });
        let options = new RequestOptions({headers: headers});

        if (evolutionId == null) {
            return this._http.get(this.url + 'levels', options).map(res => res.json());
        } else {
            return this._http.get(this.url + 'levels/' + evolutionId, options).map(res => res.json());
        }        
    }
}
