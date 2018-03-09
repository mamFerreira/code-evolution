import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public token;
  public errorMessage;  

  constructor(
    private _userService: UserService,
    private _router: Router
  ) {}

  ngOnInit() {        
    // Comprobar que el token es válido y no ha expirado
    this.token = this._userService.getToken(); 

    /*this._userService.checkToken().subscribe(
      res => {
        if (res.check) {
          this.tokenValid = true;
        } else {
          this.tokenValid = true;
          this.errorMessage = res.message;
        }       
      },
      err => {  
        this.tokenValid = true;
        this.errorMessage = err.message;             
      }
    );*/
  }

}
