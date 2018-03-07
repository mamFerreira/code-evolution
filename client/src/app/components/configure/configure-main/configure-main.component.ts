import { Component, OnInit } from '@angular/core';

// Importar servicios
import { UserService } from '../../../services/user.service';
import { EvolutionService } from '../../../services/evolution.service';
import { LevelService } from '../../../services/level.service';



@Component({
  selector: 'app-configure-main',
  templateUrl: './configure-main.component.html',
  styleUrls: ['./configure-main.component.css']
})
export class ConfigureMainComponent implements OnInit {

  public title: string;
  public identity;
  public option: string;
  public list;
  public errorMessage: string;

  constructor(
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService
  ) { 
    this.title = 'Menú configuración';
    this.identity = this._userService.getIdentity();
    this.option = '';    
  }

  ngOnInit() {
  }

  changeOption(opt) {
    this.option = opt;    
    this.list = [];
    switch (opt) {
      case 'user':
        this.getUsers();
        break;
      case 'evolution':
        this.getEvolutions();
        break;
      case 'level':
        this.getLevels();
        break;
      default:
        this.errorMessage = 'Error: Opción incorrecta';
    }
  }

  getUsers() {
    this._userService.getUsers().subscribe(
      res => {
        if (!res.users) {
          this.errorMessage = 'Error al obtener listado de usuarios';
        } else {
          this.list = res.users;
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  getEvolutions() {
    this._evolutionService.getEvolutions().subscribe(
      res => {
        if (!res.evolutions) {
          this.errorMessage = 'Error al obtener listado de evoluciones';
        } else {
          this.list = res.evolutions;
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  getLevels() {
    this._levelService.getLevels().subscribe(
      res => {
        if (!res.levels) {
          this.errorMessage = 'Error al obtener listado de evoluciones';
        } else {
          this.list = res.levels;
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  removeUser(id) {
    this._userService.removeUser(id).subscribe(
      res => {
        if (!res.user) {
          this.errorMessage = 'Error al eliminar el usuario';
        } else {
          alert('Usuario eliminado con éxito');
          this.getUsers();
        }
      },
      err => {
        this.errorMessage = err.error.message;
      }
    );
  }

  

  editElement(id) {
    alert(id);
  }
}
