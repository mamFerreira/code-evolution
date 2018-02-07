import {Component, OnInit} from '@angular/core';

import { GLOBAL } from '../services/global';
import { UserService } from '../services/user.service';
import { User } from '../models/user';


@Component({
    selector: 'user_edit',
    templateUrl: '../views/user_edit.html',
    providers: [UserService]
})

export class UserEditComponent implements OnInit {

    public titulo: String;
    public user: User;
    public identity;
    public token;
    public successMessage;
    public errorMessage;
    public filesToUpload: Array<File>;
    public url: String;

    constructor(
        private _userService: UserService
    ){
        this.titulo = 'Actualizar mis datos';        
        this.identity = this._userService.getIdentity();
        this.token = this._userService.getToken();           
        this.user = this.identity;
        this.url = GLOBAL.url;
    }

    ngOnInit(){             
    }

    onSubmit(){

        this.errorMessage = "";
        this.successMessage = "";

        this._userService.updateUser(this.user).subscribe(
            response => {
                
                if(!response.user){
                    this.errorMessage = "Usuario no actualizado";
                }else{                                        
                    localStorage.setItem('identity',JSON.stringify(this.user));
                    document.getElementById("nav_user_name").innerHTML = this.user.name;

                    if(this.filesToUpload){
                        this.makeFileRequest(this.url + 'user-upload',[],this.filesToUpload).then(
                            (result: any) => {
                                this.user.image = result.image;
                                let image_path = this.url + 'user-load/' + this.user.image;

                                localStorage.setItem('identity',JSON.stringify(this.user));
                                document.getElementById("nav_user_image").setAttribute('src',image_path);
                            }
                        );
                    }

                    this.successMessage = "Usuario actualizado correctamente"
                }

            },
            error => {                
                var _error = <any> error;
    
                if(_error != null){          
                    this.errorMessage = JSON.parse(error._body).message;
                    console.log(_error);
                }                  
            }
        );
    }

    fileChangeEvent(fileInput: any){     
        this.filesToUpload = <Array<File>> fileInput.target.files;             
    }

    makeFileRequest(url: string, params: Array<string>, files:Array<File>){

        var token = this.token;
        
        return new Promise(function(resolve,reject){
            var formData:any = new FormData();
            var xhr = new XMLHttpRequest();

            for(var i=0; i < files.length; i++){
                formData.append('image',files[i],files[i].name);
            }

            xhr.onreadystatechange = function (){
                if (xhr.readyState == 4){
                    if(xhr.status == 200){
                        resolve(JSON.parse(xhr.response));
                    }                    
                    else{
                        reject(xhr.response);
                    }
                }
            }

            xhr.open('POST',url,true);
            xhr.setRequestHeader('Authorization',token);
            xhr.send(formData);
        });
    }

}