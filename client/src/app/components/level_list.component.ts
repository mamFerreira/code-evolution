import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

import { GLOBAL } from '../services/global';
import { Evolution } from '../models/evolution';
import { Level } from '../models/level';
import { UserService } from '../services/user.service';
import { EvolutionService } from '../services/evolution.service';
import { LevelService } from '../services/level.service';

@Component({
    selector: 'app-level-list',
    templateUrl: '../views/level_list.html',
    providers: [UserService, EvolutionService, LevelService]
})

export class LevelListComponent implements OnInit {

    public title: string;
    public evolution: Evolution;
    public levels: Level[];    
    public identity;
    public token;
    public url: string;
    public checkEvolution: boolean;
    
    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,
        private _evolutionService: EvolutionService,
        private _levelService: LevelService
    ) {
        this.title = 'Seleccione un nivel'; 
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;          
    }

    ngOnInit() {    
        this.verifyEvolution();
        this.getEvolution();                
    }    

    verifyEvolution(){
        this._route.params.forEach((params:Params) => {
            let id = params['id'];

            this._evolutionService.verifyEvolution(this.token,id).subscribe(
                response => {
                    if(!response.verify){
                        this._router.navigate(['/home']);
                    }else{
                        this.checkEvolution = response.verify === 'true';
                        console.log(this.checkEvolution);
                    }
                },
                error => {
                    var errorMessage = <any> error;
                    
                    if(errorMessage != null){
                        var body = JSON.parse(error._body);                        
                        console.log(error);
                    }
                }
            );
        });
    }

    getEvolution(){
        this._route.params.forEach((params:Params) => {
            let id = params['id'];
            
            this._evolutionService.getEvolution(this.token, id).subscribe(
                response => {
                    if(!response.evolution){
                        this._router.navigate(['/home']);
                    }else{
                        this.evolution = response.evolution;                        
                        //Obtener todos los nivels asociados a la evolución
                        this._levelService.getLevels(this.token, id).subscribe(
                            response => {
                                if (!response.levels){
                                    this._router.navigate(['/home']);
                                }else{
                                    this.levels = response.levels;                                    
                                }
                            },
                            error => {
                                var errorMessage = <any> error;
                                
                                if(errorMessage != null){
                                    var body = JSON.parse(error._body);                        
                                    console.log(error);
                                }
                            }
                        );
                    }
                },
                error => {
                    var errorMessage = <any> error;
                    
                    if(errorMessage != null){
                        var body = JSON.parse(error._body);                        
                        console.log(error);
                    }
                }
            );
        });
    }

}