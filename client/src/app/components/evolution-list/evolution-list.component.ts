import { Component, OnInit } from '@angular/core';

import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';
import { EvolutionService } from '../../services/evolution.service';
import { LevelService } from '../../services/level.service';
import { GameService } from '../../services/game.service';

import { Evolution } from '../../models/evolution.model';
import { Learning } from '../../models/learning.model';
import { Global } from '../../enum/global';

@Component({
  selector: 'app-evolution-list',
  templateUrl: './evolution-list.component.html',
  styleUrls: ['./evolution-list.component.css'],
  providers: [AlertService, UserService, EvolutionService, LevelService, GameService]
})
export class EvolutionListComponent implements OnInit {

  public title: string;
  public url: string;  
  public evolutions: Evolution[];  
  public evolution: Evolution;
  public learnings: Learning[];  
  public playable: boolean[];  
  public contable: number;
  public identity;

  constructor(        
    private _alertService: AlertService,
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _gameService: GameService    
  ) {
    this.title = 'Seleccionar organismo';
    this.url = Global.url_api;
    this.identity = this._userService.getIdentity();   
    this.playable = new Array();  
    this.contable = 0;   
  }

  ngOnInit() {    
    this.getEvolutions();
  }

  getEvolutions() {    
    this._evolutionService.getEvolutions().subscribe(
      res => {
        if (!res.evolutions) {
          this._alertService.error(res.message);                  
        } else {

          this.evolutions = res.evolutions;  

          if (!this.identity.admin) {
            res.evolutions.forEach((item, index) => {
              this._levelService.getLevelsEvolution(item._id, '1').subscribe(              
                res1 => {
                  this.playable.push(false);

                  if (res1.levels && res1.levels.length > 0) {
                    this._gameService.getGame(this.identity._id, res1.levels[0]._id).subscribe(
                      res2 => {
                        if (res2.games && res2.games.length > 0) {
                          this.playable[index] = true;
                          this.contable += 1;  
                        } else {                                                    
                          this.contable += 1;  
                        }
                      },
                      err2 => {                        
                        this._alertService.error(err2.error.message);
                      }
                    );                    
                  } else {
                    this.contable += 1;
                  }                                           
                },
                err1 => {
                  this._alertService.error(err1.error.message);
                }
              );
            }); 
          }          
        }
      },
      err => {        
        this._alertService.error(err.error.message);
      }
    );
  }

  getLearnings(evolution_selected) {     
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
