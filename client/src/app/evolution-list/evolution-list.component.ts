import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../services/global.service';
import { EvolutionService } from '../services/evolution.service';
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
  public errosMessagge: string;

  constructor(
    private _globalService: GlobalService,
    private _evolutionService: EvolutionService,
    private _router: Router
  ) {
    this.title = 'Seleccione una evolución de organismo';
    this.url = this._globalService.url;
  }

  ngOnInit() {
    this.getEvolutions();
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

}
