import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

import { UserService } from '../../services/user.service';
import { EvolutionService } from '../../services/evolution.service';
import { LevelService } from '../../services/level.service';
import { GoalService } from '../../services/goal.service';
import { LearningService } from '../../services/learning.service';
import { ActionService } from '../../services/action.service';

import { Evolution } from '../../models/evolution.model';
import { Level } from '../../models/level.model';
import { LevelGoal } from '../../models/level_goal.model';
import { LevelLearning } from '../../models/level_learning.model';
import { LevelAction } from '../../models/level_action.model';
import { Global } from '../../enum/global';

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
  public goals: LevelGoal[];
  public learnings: LevelLearning[];
  public actions: LevelAction[];
  public errosMessagge: string;
  public identity;
  // Variables control menus
  private showGoals: boolean;
  private showActions: boolean;
  private showLearnings: boolean;

  constructor(    
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelSercice: LevelService,
    private _goalService: GoalService,
    private _learningService: LearningService,
    private _actionService: ActionService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.title = 'Seleccionar nivel';
    this.url = Global.url_api;
    this.identity = this._userService.getIdentity();
    this.showGoals = true;
    this.showActions = true;
    this.showLearnings = false;
  }

  ngOnInit() {
    this.getEvolution();
    this.getLevels();    
  }

  getEvolution() {
    this._route.params.forEach((params: Params) => {
      let id = params['id'];      
      this._evolutionService.getEvolution(id).subscribe(
        res => {
          if (!res.evolution) {
            this.errosMessagge = res.message;
          } else {
            this.evolution = res.evolution;                        
          }
        },
        err => {
          this.errosMessagge = err.error.message;
        }
      );
    });
    
  } 

  getLevels() {
    this._route.params.forEach((params: Params) => {
      let id = params['id'];      
      this._levelSercice.getLevelsEvolution(id).subscribe(
        res => {          
          if (!res.levels) {
            this._router.navigate(['/']);
          } else {
            this.levels = res.levels;                    
            // Selección del nivel activo
            if (this.identity.level.evolution._id === id) {            
              this.level = this.identity.level;                                                                                          
            } else {
              this.level = res.levels[0];
            }   
            this.getGoals();
            this.getLearnings();
            this.getActions();
          }
        },
        err => {          
          this.errosMessagge = err.error.message;
        }
      );
    });
  }

  getGoals() {
    this._goalService.getGoalsLevel(this.level._id).subscribe(
      res => {        
        if (res.goals) {
          this.goals = res.goals;          
        }
      },
      err => {
        this.errosMessagge = err.error.message;
      }
    );
  }

  getLearnings() {
    this._learningService.getLearningsLevel(this.level._id).subscribe(
      res => {
        if (res.learnings) {
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
        this.errosMessagge = err.error.message;
      }
    );
  }

  getActions() {
    this._actionService.getActionsLevel(this.level._id).subscribe(
      res => {
        if (res.actions) {          
          this.actions = res.actions.sort( (o1, o2) => {
            if (o1.order > o2.order) {
              return 1;
            } else {
              return 0;
            }
          });  
        }
      },
      err => {
        this.errosMessagge = err.error.message;
      }
    );
  }

  changeLevel(level_selected) {
    this.level = level_selected;
    this.getGoals();
    this.getLearnings();
    this.getActions();
  }

}
