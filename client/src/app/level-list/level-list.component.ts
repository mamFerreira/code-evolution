import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

import { UserService } from '../services/user.service';
import { LevelService } from '../services/level.service';
import { Level } from '../models/level.model';

@Component({
  selector: 'app-level-list',
  templateUrl: './level-list.component.html',
  styleUrls: ['./level-list.component.css']
})

export class LevelListComponent implements OnInit {

  public title: string;
  public levels: Level[];
  public level: Level;
  public errosMessagge: string;
  public identity;

  constructor(
    private _userService: UserService,
    private _levelSercice: LevelService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.title = 'Seleccione un nivel';
    this.identity = this._userService.getIdentity();
  }

  ngOnInit() {
    this.getLevels();
  }

  getLevels() {
    this._route.params.forEach((params: Params) => {
      let id = params['id'];

      this._levelSercice.getLevels(id).subscribe(
        res => {
          if (!res.levels) {
            this._router.navigate(['/']);
          } else {
            this.levels = res.levels;
            this.level = res.levels[0];
          }
        },
        err => {
          this.errosMessagge = err.error.message;
        }
      );
    });
  }

  changeLevel(level_selected) {
    this.level = level_selected;
  }

}
