import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

// Importar servicios
import { UserService } from '../../../services/user.service';
import { EvolutionService } from '../../../services/evolution.service';
import { LevelService } from '../../../services/level.service';
// Importar modelos
import { User } from '../../../models/user.model';
import { Evolution } from '../../../models/evolution.model';
import { Level } from '../../../models/level.model';

import { Global } from '../../../enum/global';

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
  public fileImage: Array<File>;
  public filePlayer: Array<File>;
  // public fileSurface: Array<File>;
  // public fileBlock: Array<File>;
  public fileTiledSet: Array<File>;
  public errorMessage: Array<string>;
  public errorLevels: string;
  public successMessage: string;
  public boolEdit: boolean;

  constructor(    
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { 
    this.title = 'Editar evolución';
    this.identity = this._userService.getIdentity();
    this.errorMessage = new Array<string> ();  
    this.successMessage = '';
    this.boolEdit = true;
    this.url = Global.url_api;
  }

  ngOnInit() {
    this._route.params.forEach((params: Params) => {              
      if (params['id']) {
        this.getEvolution(params['id']);
        this.getLevels(params['id']);
      } else {
        this.boolEdit = false;
        this.title = 'Añadir evolución';
        this.evolution = new Evolution (null, null, '', '', '', '', '', null , '');
      }      
    });    
  }

  getEvolution (id: string) {    
    this._evolutionService.getEvolution(id).subscribe(
      res => {
        if (!res.evolution) {
          this.errorMessage.push('Error: No se ha podido obtener la evolución deseada');
        } else {
          this.evolution = res.evolution;                      
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  getLevels (id: string) {
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

  fileChangeEvent(fileInput: any, type: string) {     
    switch (type) {
      case 'image':
        this.fileImage = <Array<File>> fileInput.target.files;   
        break;
      case 'player':
        this.filePlayer = <Array<File>> fileInput.target.files;   
        break;
      case 'tiledset': // 'ts_surface':
        this.fileTiledSet = <Array<File>> fileInput.target.files;   
        break;
      // case 'ts_block':
        // this.fileBlock = <Array<File>> fileInput.target.files;   
        // break;
      default:
        this.errorMessage.push('Tipo de imagen desconocido');
    }           
  }

  makeFileRequest(url: string, params: Array<string>, files: Array<File>) {

    let token = this._userService.getToken();
    
    return new Promise((resolve, reject) => {
        let formData: any = new FormData();
        let xhr = new XMLHttpRequest();

        for (let i = 0; i < files.length; i++) {
            formData.append('image', files[i], files[i].name);
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if ( xhr.status === 200) {
                    resolve(JSON.parse(xhr.response));
                } else {
                    reject(xhr.response);
                }
            }
        };

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Authorization', token);
        xhr.send(formData);
    });
  }

  onSubmit() {
    this.errorMessage = [];
    this.successMessage = '';

    if (this.boolEdit) {
      this.editEvolution();
    } else {
      this.addEvolution();
    }


  }

  editEvolution() {
    

    this._evolutionService.updateEvolution(this.evolution).subscribe(
      res => {
        if (!res.evolution) {
          this.errorMessage.push('Operación no completada con éxito: ' + res.message);
        } else {        
          if (this.fileImage) {
            this.makeFileRequest(this.url + 'evolution-upload-I/' +  this.evolution._id, [], this.fileImage).then(
              (res: any) => {
                  if (res.image) {
                    this.evolution.image = res.image;
                  } else {
                    this.errorMessage.push('Subida de Image no realizada: ' + res.message);
                  }                       
              }
          ); }

          if (this.filePlayer) {
            this.makeFileRequest(this.url + 'evolution-upload-P/' +  this.evolution._id, [], this.filePlayer).then(
              (res: any) => {
                  if (res.image) {
                    this.evolution.player = res.image;
                  } else {
                    this.errorMessage.push('Subida de Player no realizada: ' + res.message);
                  }                       
              }
          ); }

          if (this.fileTiledSet) {
            this.makeFileRequest(this.url + 'evolution-upload-T/' +  this.evolution._id , [], this.fileTiledSet).then(
              (res: any) => {
                  if (res.image) {
                    this.evolution.tiledset = res.image;
                  } else {
                    this.errorMessage.push('Subida de TiledSet no realizada: ' + res.message);
                  }                       
              }
          ); }

          /*if (this.fileBlock) {
            this.makeFileRequest(this.url + 'evolution-upload-T/' +  this.evolution._id + '/B', [], this.fileBlock).then(
              (res: any) => {
                  if (res.image) {
                    this.evolution.tiledset_block = res.image;
                  } else {
                    this.errorMessage.push('Subida de TS Block no realizada: ' + res.message);
                  }                       
              }
          ); }*/

          this.successMessage = 'Evolución actualizada correctamente';
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  addEvolution () {
    this._evolutionService.addEvolution(this.evolution).subscribe(
      res => {
        if (!res.evolution) {
          this.errorMessage.push('Error al añadir evolución: ' + res.message);
        } else {            
          this.successMessage = 'Evolución añadida correctamente';          
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

}
