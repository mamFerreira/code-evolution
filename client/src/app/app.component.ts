import { Component } from '@angular/core';
import { User } from './models/user';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  public title = 'CODE-EVOLUTION';
  public user: User;
  public identity;
  public token;

  constructor(){
    this.user = new User ('','','','','','ROLE_USER','','');

  }

}
