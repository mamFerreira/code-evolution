import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { GLOBAL } from './global';

@Injectable()
export class EvolutionService {

    public url: string;

    constructor (private _http: Http){
        this.url = GLOBAL.url;
    }

    getEvolutions(token){
        let headers = new Headers({
            'Content-Type' : "application/json",
            'Authorization': token
        });
        let options = new RequestOptions({headers:headers});
        console.log("Token: " + token);

        return this._http.get(this.url+'evolutions',options).map(res=>res.json());
    }

}