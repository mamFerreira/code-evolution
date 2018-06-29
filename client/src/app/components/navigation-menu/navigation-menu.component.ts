import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UserService } from '../../services/user.service';
import { Global } from '../../enum/global';
// import { ConsoleReporter } from 'jasmine';

@Component({
  selector: 'app-navigation-menu',
  templateUrl: './navigation-menu.component.html',
  styleUrls: ['./navigation-menu.component.css'],
  providers: [UserService]
})
export class NavigationMenuComponent implements OnInit {

  public identity;
  public url: string;
  public option: string;

  constructor(
    private _router: Router,
    private _userService: UserService    
  ) {
    this.url = Global.url_api;
    this.identity = this._userService.getIdentity();    
    this.option = '';
  }

  ngOnInit() {     
    if (this._router.url.search('jugar') > 0) {
      this.option = 'play';
    } else if (this._router.url.search('mis-datos') > 0) {
      this.option = 'user';
    } else if (this._router.url.search('ayuda') > 0) {
      this.option = 'help';
    } else if (this._router.url.search('admin') > 0) {
      this.option = 'admin';
    }    
  }

  logout() {
    localStorage.removeItem('identity');
    localStorage.removeItem('token');
    window.location.reload();
  }

  changeOption(type) {
    console.log(type);
    this.option = type;    
  }

}
