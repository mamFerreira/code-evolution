import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { GLOBAL } from '../../enum/global.enum';

@Component({
  selector: 'app-user-update',
  templateUrl: './user-update.component.html',
  styleUrls: ['./user-update.component.css'],
  providers: [AlertService, UserService]
})

export class UserUpdateComponent implements OnInit {
  
  public title: string;
  @ViewChild('form') form: NgForm;
  public user: User;
  public url: string;
  public token: string;
  public filesToUpload: Array<File>;

  constructor(     
    private _alertService: AlertService,
    private _userService: UserService
  ) {
    this.title = 'Actualizar datos de cuenta';
    this.user = this._userService.getIdentity();
    this.token = this._userService.getToken();
    this.url = GLOBAL.URL_API;
  }

  ngOnInit() { }

  onSubmit() {       
    this._userService.updateUser(this.user).subscribe(
      res => {
        if (!res.user) {
          this._alertService.error(res.message);
        } else {
          localStorage.setItem('identity', JSON.stringify(this.user));
          document.getElementById('navbar-user-email').innerHTML = this.user.email;          
          this._alertService.success('Usuario actualizado correctamente');
        }
      },
      err => {        
        this._alertService.error(err.error.message);
      }
    );      
  }
}
