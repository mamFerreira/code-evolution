import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';

import { AlertService } from '../../services/alert.service';
import { UserService } from '../../services/user.service';
import { EvolutionService } from '../../services/evolution.service';
import { LevelService } from '../../services/level.service';
import { GoalService } from '../../services/goal.service';
import { GameService } from '../../services/game.service';

import { Evolution } from '../../models/evolution.model';
import { Level } from '../../models/level.model';
import { LevelGoal } from '../../models/level_goal.model';
import { Goal } from '../../models/goal.model';
import { Learning } from '../../models/learning.model';
import { Action } from '../../models/action.model';
import { GLOBAL } from '../../enum/global.enum';

@Component({
  selector: 'app-level-list',
  templateUrl: './level-list.component.html',
  styleUrls: ['./level-list.component.css']
})

export class LevelListComponent implements OnInit {

  public title: string;
  public url: string;
  public evolution: Evolution;
  public level: Level;
  public levels: Level[];
  public levels_: Level[];
  public goals: LevelGoal[];
  public learnings: Learning[];
  public actions: Action[];  
  public identity;
  // Variables control menus
  public showGoals: boolean;
  public showActions: boolean;
  public showLearnings: boolean;

  constructor(   
    private _alertService: AlertService, 
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService, 
    private _goalService: GoalService,
    private _gameService: GameService,   
    private _route: ActivatedRoute    
  ) {
    this.title = 'Seleccionar Nivel';
    this.url = GLOBAL.URL_API;
    this.identity = this._userService.getIdentity();
    this.showGoals = true;
    this.showActions = true;
    this.showLearnings = true;
    this.levels = new Array<Level> ();
    this.levels_ = new Array<Level> ();
  }

  ngOnInit() {
    this.getEvolution();
    this.getLevels();    
  }

  getEvolution() {
    this._route.params.forEach((params: Params) => {
      let id = params['id'];      
      this._evolutionService.getEvolutions(id).subscribe(
        res => {
          if (res.evolutions && res.evolutions.length > 0) {
            this.evolution = res.evolutions[0];              
          } else {
            this._alertService.error(res.message);
          }
        },
        err => {
          this._alertService.error(err.error.message);
        }
      );
    });
    
  } 

  getLevels() {
    this._route.params.forEach((params: Params) => {
      let id = params['id'];      
      this._levelService.getLevelsEvolution(id).subscribe(
        res => {          
          if (!res.levels) {
            this._alertService.error(res.message);
          } else {   
            if (this.identity.admin) {

              this.levels = res.levels;
              this.level = res.levels[0];
              this.getGoals();
              this.getLearnings();
              this.getActions();

            } else {     
              let i = 0;
              res.levels.forEach((item, index) => {
                this._gameService.getGame(this.identity._id, item._id).subscribe(
                  res2 => {
                    i = i + 1;
                    if (res2.games && res2.games.length > 0) {
                      this.levels_.push(item);                                                              
                    }
  
                    if (i === res.levels.length) {                      
                      this.levels = this.levels_.sort( (l1, l2) => {
                        if (l1.order > l2.order) {
                          return 1;
                        } else {
                          return 0;
                        }
                      });
                      this.level = this.levels[this.levels.length - 1];
                      this.getGoals();
                      this.getLearnings();
                      this.getActions(); 
                    }
                    
                  },
                  err2 => {                        
                    this._alertService.error(err2.error.message);
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
    });
  }

  getGoals() {
    this._levelService.getGoals(this.level._id).subscribe(
      res => {                  
        if (!res.goals) {
          this._alertService.error(res.message); 
        } else {                              
            res.goals.forEach((item, index, array) => {
              this._goalService.getGoals(item.goalID).subscribe(              
                resG => {                                                                        
                  if (resG.goals && resG.goals.length > 0) {
                    item.goal = resG.goals[0];                 
                  } else {
                    item.goal = new Goal('', '', '');
                  }                         
                  if (index === array.length - 1) {                  
                    this.level.goals = res.goals;                   
                  }
                },
                errG => {                  
                  this._alertService.error(errG.message);
                }
              );
            });                                                                                             
        }                                     
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  getLearnings() {
    this._levelService.getLearnings(this.level._id).subscribe(
      res => {                  
        if (!res.learnings) {
          this._alertService.error(res.message); 
        } else {
          this.level.learnings = [];          
          res.learnings.forEach(element => {
            this.level.learnings.push(element.learningID);
          });                             
        }                                     
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  getActions() {
    this._levelService.getActions(this.level._id).subscribe(
      res => {                  
        if (!res.actions) {
          this._alertService.error(res.message); 
        } else {
          this.level.actions = [];  
          res.actions.forEach(element => {
            this.level.actions.push(element.actionID);
          });                   
        }                                     
      },
      err => {
        this._alertService.error(err.error.message);
      }
    );
  }

  changeLevel(level_selected) {
    this.level = level_selected;
    this.showGoals = true;
    this.showActions = true;
    this.showLearnings = true;
    this.getGoals();
    this.getLearnings();
    this.getActions();
  }

}
