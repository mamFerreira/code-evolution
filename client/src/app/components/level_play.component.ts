import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

import { GLOBAL } from '../services/global';
import { Level } from '../models/level';
import { UserService } from '../services/user.service';
import { LevelService } from '../services/level.service';


@Component({
    selector: 'app-level-play',
    templateUrl: '../views/level_play.html',
    providers: [UserService, LevelService]
})

export class LevelPlayComponent implements OnInit {

    public title: string;
    public level: Level;    
    public identity;
    public token;
    public url: string;
    
    constructor(
        private _route: ActivatedRoute,
        private _router: Router,
        private _userService: UserService,        
        private _levelService: LevelService
    ) {
        this.title = 'Empieze a jugar al nivel';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;         
    }

    ngOnInit() {
        //FALTA: Comprobar que el usuario puede jugar el nivel

        this.getEvolutionAndLevel();        
    }

    getEvolutionAndLevel(){
        this._route.params.forEach((params:Params) => {
            let id = params['id'];

            this._levelService.getLevel(this.token, id).subscribe(
                response => {
                    if (!response.level){
                        this._router.navigate(['/home']);
                    }else{
                        this.level = response.level;                                                  
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