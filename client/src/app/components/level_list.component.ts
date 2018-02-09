import {Component, OnInit} from '@angular/core';

import { GLOBAL } from '../services/global';
import { Level } from '../models/level';
import { UserService } from '../services/user.service';
import { LevelService } from '../services/level.service';

@Component({
    selector: 'app-level-list',
    templateUrl: '../views/level_list.html',
    providers: [UserService, LevelService]
})

export class LevelListComponent implements OnInit {    

    public titulo: string;
    public levels: Level[];    
    public identity;
    public token;
    public url: string;

    constructor(
        private _userService: UserService,
        private _levelService: LevelService
    ) {
        this.titulo = '';
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();
        this.url = GLOBAL.url;        
    }

    ngOnInit() {
        this.getLevels();
    }

    getLevels(){
        this._route.params.forEach((params:Params) => {
            let id = params['id'];
            this._artistService.getArtist(this.token,id).subscribe(
                response => {
                    if(!response.artist){
                        this._router.navigate(['/']);
                    }else{
                        this.artist = response.artist;
                        
                        //Sacar los albums del artista
                        this._albumService.getAlbums(this.token,response.artist._id).subscribe(
                            response => {
                                if(!response.albums){
                                    this.alertMessage = 'Este artista no tiene albums'
                                }else{
                                    this.albums = response.albums;                                
                                }
                            },                            
                            error => {
                                var errorMessage = <any> error;
                                
                                if(errorMessage != null){
                                    var body = JSON.parse(error._body);
                                    //this.alertMessage = body.message;
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
                        //this.alertMessage = body.message;
                        console.log(error);
                    }
                }
            );
        });
    }

}
