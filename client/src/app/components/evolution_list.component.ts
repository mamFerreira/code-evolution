import {Component, OnInit} from '@angular/core';

import { GLOBAL } from '../services/global';
import { Evolution } from '../models/evolution';
import { UserService } from '../services/user.service';
import { EvolutionService } from '../services/evolution.service';

@Component({
    selector: 'app-evolution-list',
    templateUrl: '../views/evolution_list.html',
    providers: [UserService, EvolutionService]
})

export class EvolutionListComponent implements OnInit {    

    public title: string;
    public evolutions: Evolution[];    
    public identity;
    public token;
    public url: string;

    constructor(
        private _userService: UserService,
        private _evolutionService: EvolutionService
    ) {
        this.title = 'Seleccione una evolución';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;        
    }

    ngOnInit() {
        this.getEvolutions();
    }

    getEvolutions() {
        this._evolutionService.getEvolutions(this.token).subscribe(
            response => {
                if (!response.evolutions) {
                    // Hacer algo
                } else {
                    this.evolutions = response.evolutions;                  
                }
            },
            error => {
                let errorMessage = <any> error;
                    
                if (errorMessage != null) {
                    let body = JSON.parse(error._body);
                    // this.alertMessage = body.message;
                    console.log(error);
                }
            }
        );
    }

}
