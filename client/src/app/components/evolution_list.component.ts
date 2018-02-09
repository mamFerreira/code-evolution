import {Component, OnInit} from '@angular/core';

import { GLOBAL } from '../services/global';
import { EvolutionService } from '../services/evolution.service';
import { Evolution } from '../models/evolution';
import { UserService } from '../services/user.service';

type IDictionary = [string, number];

@Component({
    selector: 'app-evolution-list',
    templateUrl: '../views/evolution_list.html',
    providers: [EvolutionService]
})

export class EvolutionListComponent implements OnInit {    

    public titulo: string;
    public evolutions: Evolution[];    
    public identity;
    public token;
    public url: string;

    constructor(
        private _userService: UserService,
        private _evolutionService: EvolutionService
    ) {
        this.titulo = '';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;        
    }

    ngOnInit() {
        this.getEvolution();
    }

    getEvolution() {
        this._evolutionService.getEvolutions(this.token).subscribe(
            response => {
                if (!response.evolutions) {
                    // Hacer algo
                } else {
                    this.evolutions = response.evolutions;
                    for (let i = 0; i < this.evolutions.length; i++) {
                        this._evolutionService.getNumLevels(this.token, this.evolutions[i]._id ).subscribe(
                            response => {
                                this.evolutions[i].num_levels = response.count;
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
