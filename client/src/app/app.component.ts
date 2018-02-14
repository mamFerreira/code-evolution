import { Component, OnInit } from '@angular/core';
import { UserService } from './services/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public token;

  constructor(
    private _userService: UserService
  ) {}

  ngOnInit() {
    this.token = this._userService.getToken();
    //FALTA: Comprobar que el token es válido antes de almacenarlo en this.token
  }

}
