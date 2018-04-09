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
  private errorMsg: string;

  constructor(
    private _userService: UserService    
  ) {
    this.token = false;
    this.tokenChecked = false;
    this.errorMsg = '';
  }

  // Comprobamos la validez del token
  ngOnInit() {    
    this._userService.checkToken().subscribe(
      res => {
        if (res.check) {
          this.token = true;
          this.tokenChecked = true;
        } else {
          this.errorMsg = res.message;
          this.tokenChecked = true;
        }
      },
      err => {
        this.errorMsg = err.message;
        this.tokenChecked = true;
      }
    );
  }
}
