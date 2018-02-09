import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';


@Component({
    selector: 'app-level-play',
    templateUrl: '../views/level_play.html',
    providers: []
})

export class LevelPlayComponent implements OnInit {

    public title: string;
    
    constructor(
        private _route: ActivatedRoute,
        private _router: Router
    ) {
        this.title = 'Empieze a jugar al nivel';        
    }

    ngOnInit() {
        //Comprobar si el usuario ha llegado al nivel
    }

}