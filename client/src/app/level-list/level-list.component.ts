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
      let order = '';
      // Comprobamos si la evolucion seleccionada es la actual del jugador
      if (id === this.identity.level.evolution && this.identity.role === 'ROLE_USER') {
        order = String(this.identity.level.order);
      }

      this._levelSercice.getLevels(id, order).subscribe(
        res => {
          if (!res.levels) {
            this._router.navigate(['/']);
          } else {
            this.levels = res.levels;
            let level_id = this.levels[0]._id;
            if (id === this.identity.level.evolution) {
              level_id = this.identity.level._id;
            }
            this._levelSercice.getLevel(level_id).subscribe(
              res => {
                if (!res.level) {
                  this._router.navigate(['/']);
                } else {
                  this.level = res.level;
                }
              },
              err => {
                this.errosMessagge = err.error.message;
              }
            );
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
