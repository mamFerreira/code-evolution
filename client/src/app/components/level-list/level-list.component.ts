import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

import { GlobalService } from '../../services/global.service';
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

  constructor(
    private _globalService: GlobalService,
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelSercice: LevelService,
    private _goalService: GoalService,
    private _learningService: LearningService,
    private _actionService: ActionService,
    private _route: ActivatedRoute,
    private _router: Router
  ) {
    this.title = 'Seleccione un nivel';
    this.url = this._globalService.url;
    this.identity = this._userService.getIdentity();
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
              this.getGoals();
              this.getLearnings();
              this.getActions();                                                                            
            } else {
              this.level = res.levels[0];
            }   
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
          this.learnings = res.learnings;          
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
          this.actions = res.actions;
        }
      },
      err => {
        this.errosMessagge = err.error.message;
      }
    );
  }

  changeLevel(level_selected) {
    this.level = level_selected;
  }

}
