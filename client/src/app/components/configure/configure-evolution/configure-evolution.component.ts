import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

// Importar servicios
import { GlobalService } from '../../../services/global.service';
import { UserService } from '../../../services/user.service';
import { EvolutionService } from '../../../services/evolution.service';
import { LevelService } from '../../../services/level.service';
// Importar modelos
import { User } from '../../../models/user.model';
import { Evolution } from '../../../models/evolution.model';
import { Level } from '../../../models/level.model';

@Component({
  selector: 'app-configure-evolution',
  templateUrl: './configure-evolution.component.html',
  styleUrls: ['./configure-evolution.component.css']
})
export class ConfigureEvolutionComponent implements OnInit {

  public title: string;
  public url: string;
  public identity;
  public evolution: Evolution;
  public levels: Level[];
  public errorMessage: string;
  public errorLevels: string;
  public successMessage: string;
  public boolEdit: boolean;

  constructor(
    private _globalService: GlobalService,
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { 
    this.title = 'Editar evolución';
    this.identity = this._userService.getIdentity();
    this.errorMessage = '';  
    this.successMessage = '';
    this.boolEdit = true;
    this.url = this._globalService.url;
  }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {              
      if (params['id']) {
        this.getEvolution(params['id']);
        this.getLevels(params['id']);
      } else {
        this.boolEdit = false;
        this.title = 'Añadir evolución';
        this.evolution = new Evolution (null, -1, '', '', '', '', '', 0 , '', '');
      }      
    });    
  }

  getEvolution (id) {    
    this._evolutionService.getEvolution(id).subscribe(
      res => {
        if (!res.evolution) {
          this.errorMessage = 'Error: No se ha podido obtener la evolución deseada';
        } else {
          this.evolution = res.evolution;                      
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  getLevels (id) {
    this._levelService.getLevelsEvolution(id).subscribe(
      res => {
        if (!res.levels) {
          this.errorLevels = 'Error: Evolución sin niveles';
        } else {
          this.levels = res.levels;                      
        }
      },
      err => {
        this.errorLevels = err.error.message;
      }
    );
  }

}
