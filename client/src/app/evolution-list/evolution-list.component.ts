import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../services/global.service';
import { EvolutionService } from '../services/evolution.service';
import { UserService } from '../services/user.service';
import { Evolution } from '../models/evolution.model';

@Component({
  selector: 'app-evolution-list',
  templateUrl: './evolution-list.component.html',
  styleUrls: ['./evolution-list.component.css']
})
export class EvolutionListComponent implements OnInit {

  public title: string;
  public url: string;
  public evolutions: Evolution[];
  public evolution: Evolution;
  public errosMessagge: string;
  public identity;

  constructor(
    private _globalService: GlobalService,
    private _evolutionService: EvolutionService,
    private _userService: UserService,
    private _router: Router
  ) {
    this.title = 'Seleccione una evolución';
    this.url = this._globalService.url;
    this.identity = this._userService.getIdentity();
  }

  ngOnInit() {
    this.getEvolution();
    this.getEvolutions();
  }

  getEvolution() {
    this._evolutionService.getEvolution(this.identity.level.evolution).subscribe(
      res => {
        if (!res.evolution) {
          this._router.navigate(['/']);
        } else {
          this.evolution = res.evolution;
        }
      },
      err => {
        this.errosMessagge = err.error.message;
      }
    );
  }

  getEvolutions() {
    this._evolutionService.getEvolutions().subscribe(
      res => {
        if (!res.evolutions) {
          this._router.navigate(['/']);
        } else {
          this.evolutions = res.evolutions;
        }
      },
      err => {
        this.errosMessagge = err.error.message;
      }
    );
  }

  changeEvolution(evolution_selected) {
    this.evolution = evolution_selected;
  }

}
