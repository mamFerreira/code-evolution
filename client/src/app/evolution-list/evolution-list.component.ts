import { Component, OnInit } from '@angular/core';

import { EvolutionService } from '../services/evolution.service';
import { Evolution } from '../models/evolution.model';

@Component({
  selector: 'app-evolution-list',
  templateUrl: './evolution-list.component.html',
  styleUrls: ['./evolution-list.component.css']
})
export class EvolutionListComponent implements OnInit {

  public title: string;
  public evolutions: Evolution[];

  constructor(
    private _evolutionService: EvolutionService
  ) { }

  ngOnInit() {
    this.getEvolutions();
  }

  getEvolutions() {
    this._evolutionService.getEvolutions().subscribe(
      res => {
        this.evolutions = res.evolutions;
      },
      err => {
        console.log(err);
      }
    );
  }

}
