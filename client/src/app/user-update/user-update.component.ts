import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { UserService } from '../services/user.service';
import { GlobalService } from '../services/global.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-user-update',
  templateUrl: './user-update.component.html',
  styleUrls: ['./user-update.component.css'],
  providers: [UserService]
})
export class UserUpdateComponent implements OnInit {
  
  public title: string;
  @ViewChild('form') form: NgForm;
  public user: User;
  public url: string;
  public token: string;
  public filesToUpload: Array<File>;
  public errorUpdate: string;
  public successUpdate: string;

  constructor(
    private _userService: UserService,
    private _globalService: GlobalService
  ) { 
    this.title = "Actualizar mi información personal";    
    this.user = this._userService.getIdentity();   
    this.token = this._userService.getToken(); 
    this.url = this._globalService.url;
  }

  ngOnInit() { }

  onSubmit() {    
    
    this.errorUpdate = '';
    this.successUpdate = '';

    this._userService.updateUser(this.user).subscribe(
      res => {
        if(!res.user){
          this.errorUpdate = 'Error al actualizar el usuario';
        }else{
          localStorage.setItem('identity',JSON.stringify(this.user));
          document.getElementById('navbar_user_name').innerHTML = this.user.name;
          
          if (this.filesToUpload){
            this.makeFileRequest(this.url + 'user-upload', [], this.filesToUpload).then(
              (result: any) => {
                  this.user.image = result.image;
                  let image_path = this.url + 'user-load/' + this.user.image;

                  localStorage.setItem('identity', JSON.stringify(this.user));
                  document.getElementById('navbar_user_image').setAttribute('src', image_path);
              }
          );
          }

          this.successUpdate = 'Usuario actualizado correctamente';
        }
      },
      err => {
        this.errorUpdate = err.error.message;
      }
    )

  }

  fileChangeEvent(fileInput: any) {     
    this.filesToUpload = <Array<File>> fileInput.target.files;             
  }

  makeFileRequest(url: string, params: Array<string>, files:Array<File>){

    let token = this.token;
    
    return new Promise(function(resolve, reject) {
        let formData: any = new FormData();
        let xhr = new XMLHttpRequest();

        for (let i = 0; i < files.length; i++) {
            formData.append('image', files[i], files[i].name);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ( xhr.status === 200) {
                    resolve(JSON.parse(xhr.response));
                } else {
                    reject(xhr.response);
                }
            }
        };

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Authorization', token);
        xhr.send(formData);
    });
}

}
