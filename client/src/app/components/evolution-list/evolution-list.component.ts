import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';
import { EvolutionService } from '../../services/evolution.service';

import { Evolution } from '../../models/evolution.model';
import { Learning } from '../../models/learning.model';
import { Global } from '../../enum/global';

@Component({
  selector: 'app-evolution-list',
  templateUrl: './evolution-list.component.html',
  styleUrls: ['./evolution-list.component.css'],
  providers: [AlertService, UserService, EvolutionService]
})
export class EvolutionListComponent implements OnInit {

  public title: string;
  public url: string;
  public evolution_player: string;  
  public evolutions: Evolution[];
  public range: number[];  
  public evolution: Evolution;
  public learnings: Learning[];  
  public identity;

  constructor(    
    private _router: Router,
    private _alertService: AlertService,
    private _userService: UserService,
    private _evolutionService: EvolutionService    
  ) {
    this.title = 'Seleccionar organismo';
    this.url = Global.url_api;
    this.identity = this._userService.getIdentity();        
  }

  ngOnInit() {
    this.getNumEvolutions();
    this.getEvolutions();
  }

  getNumEvolutions() {
    // Obtener el número de evoluciones
    this._evolutionService.getEvolutions().subscribe(
      res => {
        if (!res.num_evolutions) {
          this._router.navigate(['/']);
        } else {
          this.range = [];
          for (let i = 0; i < res.num_evolutions; i++) {
            this.range.push(i);
          }          
        }
      },
      err => {                 
        this._alertService.error(err.error.message);
      }
    );
  }


  getEvolutions() {

    // Obtener las evoluciones disponibles para jugar
    this._evolutionService.getEvolutions().subscribe(
      res => {
        if (!res.evolutions) {
          this._router.navigate(['/']);
        } else {
          this.evolutions = res.evolutions;                 
          this.evolution_player = this.identity.level.evolution._id;           
        }
      },
      err => {        
        this._alertService.error(err.error.message);
      }
    );
  }

  getLearnings(evolution_selected) {
     // Obtener obtener los aprendizajes asociados a la evolución    
     this.learnings = [];
     this._evolutionService.getLernings(evolution_selected._id).subscribe(
      res => {
        if (!res.learnings) {          
          this._alertService.error(res.message);                  
        } else {
          this.learnings = res.learnings.sort( (o1, o2) => {
            if (o1.order > o2.order) {
              return 1;
            } else {
              return 0;
            }
          });          
        }
      },
      err => {        
        this._alertService.error(err.error.message);  
      }
    );
  }

  changeEvolution(evolution_selected) {
    this.evolution = evolution_selected;
    this.getLearnings(evolution_selected);
  }
  
}
