import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private token: boolean;
  private tokenChecked: boolean;  

  constructor(
    private _userService: UserService    
  ) {
    this.token = false;
    this.tokenChecked = false;        
  }

  // Comprobamos la validez del token
  ngOnInit() {      
    this._userService.checkToken().subscribe(
      res => {        
        this.tokenChecked = true;
        if (res.check) {
          this.token = true;                  
        }
      },
      err => {                      
        this.tokenChecked = true;        
      }
    );
  }
}
