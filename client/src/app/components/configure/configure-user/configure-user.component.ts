import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';

import { AlertService } from '../../../services/alert.service';
import { UserService } from '../../../services/user.service';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-configure-user',
  templateUrl: './configure-user.component.html',
  styleUrls: ['./configure-user.component.css']
})
export class ConfigureUserComponent implements OnInit {

  public title: string;
  public identity;
  public user: User;    

  constructor(
    private _alertService: AlertService,
    private _userService: UserService,    
    private _route: ActivatedRoute,    
  ) { 
    this.title = 'Editar usuario';
    this.identity = this._userService.getIdentity(); 
  }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {
      let id = params['id'];

      this._userService.getUser(id).subscribe(
        res => {                    
          if (!res.users || res.users.length === 0) {
            this._alertService.error(res.message);              
          } else {              
            this.user = res.users[0];                        
          }
        },
        err => {
          this._alertService.error(err.message);  
        }
      );
    });
  }

  onSubmit() {    
    this._userService.updateUserById(this.user).subscribe(
      res => {
        if (!res.user) {
          this._alertService.error(res.message);  
        } else {        
          this._alertService.success('Usuario actualizado correctamente');            
        }
      },
      err => {
        this._alertService.error(err.message);  
      }
    );    
  }

}
