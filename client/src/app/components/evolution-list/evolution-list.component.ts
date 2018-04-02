import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { GlobalService } from '../../services/global.service';
import { UserService } from '../../services/user.service';
import { EvolutionService } from '../../services/evolution.service';
import { Evolution } from '../../models/evolution.model';
import { Learning } from '../../models/learning.model';

@Component({
  selector: 'app-evolution-list',
  templateUrl: './evolution-list.component.html',
  styleUrls: ['./evolution-list.component.css']
})
export class EvolutionListComponent implements OnInit {

  public title: string;
  public url: string;
  public evolution: Evolution;
  public evolutions: Evolution[];
  public range: number[];  
  public learnings: Learning[];
  public learning: Learning;
  public errorMessagge: string;
  public errorLearning: string;
  public identity;

  constructor(
    private _globalService: GlobalService,
    private _evolutionService: EvolutionService,
    private _userService: UserService,
    private _router: Router
  ) {
    this.title = 'Seleccione un organismo';
    this.url = this._globalService.url;
    this.identity = this._userService.getIdentity();        
  }

  ngOnInit() {
    this.getNumEvolutions();
    this.getEvolutions();
  }

  getNumEvolutions() {
    // Obtener el número de evoluciones
    this._evolutionService.getNumEvolutions().subscribe(
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
        this.errorMessagge = err.error.message;
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
          this.evolution = this.identity.level.evolution;
          this.getLearnings();
                    
        }
      },
      err => {
        this.errorMessagge = err.error.message;
      }
    );
  }

  getLearnings() {
     // Obtener obtener los aprendizajes asociados a la evolución
     this.errorLearning = '';
     this.learnings = [];
     this._evolutionService.getEvolutionLearnings(this.evolution._id).subscribe(
      res => {
        if (!res.learnings) {
          this.errorLearning = res.message;          
        } else {
          this.learnings = res.learnings;          
        }
      },
      err => {
        this.errorMessagge = err.error.message;        
      }
    );
  }

  changeEvolution(evolution_selected) {
    this.evolution = evolution_selected;
    this.getLearnings();
  }

  changeLearning (learning_selected) {
    this.learning = learning_selected;
  }

}
