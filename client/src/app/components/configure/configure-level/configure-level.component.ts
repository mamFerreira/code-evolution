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
  selector: 'app-configure-level',
  templateUrl: './configure-level.component.html',
  styleUrls: ['./configure-level.component.css']
})
export class ConfigureLevelComponent implements OnInit {

  public title: string;
  public url: string;
  public identity;
  public evolutions: Evolution[];
  public level: Level;
  public boolEdit: boolean;
  // Variables de ficheros
  public fileImage: Array<File>;
  public fileCode: Array<File>;
  public fileMap: Array<File>;
  // Variables con mensajes de información
  public errorMessage: Array<string>;
  public successMessage: string;

  constructor(
    private _globalService: GlobalService,
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _route: ActivatedRoute,
    private _router: Router
  ) { 
    this.boolEdit = true;
    this.title = 'Editar nivel';
    this.identity = this._userService.getIdentity();
    this.url = this._globalService.url;
    this.errorMessage = new Array<string> ();  
    this.successMessage = '';
  }

  ngOnInit() {

    this.getEvolutions();

    this._route.params.forEach((params: Params) => {              
      if (params['id']) {        
        this.getLevel(params['id']);
      } else {
        this.boolEdit = false;
        this.title = 'Añadir nivel';
        this.level = new Level (null, null, '', '', null, null, '', null, '', '');
      }      
    });
  }

  getLevel (id: string) {
    this._levelService.getLevel(id).subscribe(
      res => {
        if (!res.level) {
          this.errorMessage.push('No se ha podido obtener el nivel del servidor');
        } else {
          this.level = res.level;                      
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  getEvolutions () {
    this._evolutionService.getEvolutions().subscribe(
      res => {
        if (!res.evolutions) {          
          this.errorMessage.push('No se han podido obtener las evoluciones del servidor');
        } else {
          this.evolutions = res.evolutions;                      
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  editLevel() {
    
    this._levelService.updateLevel(this.level).subscribe(
      res => {
        if (!res.level) {
          this.errorMessage.push('Operación no completada con éxito: ' + res.message);
        } else {        
          if (this.fileImage) {
            this.makeFileRequest(this.url + 'level-upload-I/' +  this.level._id, [], this.fileImage, 'image').then(
              (res: any) => {
                  if (res.image) {
                    this.level.image = res.image;
                  } else {
                    this.errorMessage.push('Subida de Image no realizada: ' + res.message);
                  }                       
              }
          ); }

          if (this.fileCode) {
            this.makeFileRequest(this.url + 'level-upload-code/' +  this.level._id, [], this.fileCode, 'file').then(
              (res: any) => {
                console.log(res);
                  if (res.file) {
                    this.level.code_default = res.file;                    
                  } else {
                    this.errorMessage.push('Subida de fichero con código por defecto no realizada: ' + res.message);
                  }                       
              }
          ); }

          if (this.fileMap) {
            this.makeFileRequest(this.url + 'level-upload-M/' +  this.level._id, [], this.fileMap, 'file').then(
              (res: any) => {
                  if (res.file) {
                    this.level.map = res.file;
                  } else {
                    this.errorMessage.push('Subida del mapa no realizada: ' + res.message);
                  }                       
              }
          ); }
          this.successMessage = 'Nivel actualizado correctamente';
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  addLevel () {
    this._levelService.addLevel(this.level).subscribe(
      res => {
        if (!res.level) {
          this.errorMessage.push('Error al añadir nivel: ' + res.message);
        } else {            
          this.successMessage = 'Nivel añadido correctamente';          
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  activateLevel() {
    this._levelService.activateLevel(this.level._id).subscribe(
      res => {
        if (!res.level) {
          this.errorMessage.push('No se ha podido activar el nivel');
        } else {
          this.level.active = 1;                  
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  desactivateLevel() {
    this._levelService.desactivateLevel(this.level._id).subscribe(
      res => {
        if (!res.level) {
          this.errorMessage.push('No se ha podido desactivar el nivel');
        } else {
          this.level.active = 0;                  
        }
      },
      err => {
        this.errorMessage.push(err.error.message);
      }
    );
  }

  onSubmit() {
    this.errorMessage = [];
    this.successMessage = '';

    if (this.boolEdit) {
      this.editLevel();
    } else {
      this.addLevel();
    }


  }

  fileChangeEvent(fileInput: any, type: string) {     
    switch (type) {
      case 'image':
        this.fileImage = <Array<File>> fileInput.target.files;   
        break;
      case 'code_default':
        this.fileCode = <Array<File>> fileInput.target.files;   
        break;
      case 'map':
        this.fileMap = <Array<File>> fileInput.target.files;   
        break;
      default:
        this.errorMessage.push('Tipo de imagen desconocido');
    }           
  }

  makeFileRequest(url: string, params: Array<string>, files: Array<File>, type: string) {

    let token = this._userService.getToken();
    
    return new Promise((resolve, reject) => {
        let formData: any = new FormData();
        let xhr = new XMLHttpRequest();

        for (let i = 0; i < files.length; i++) {
            formData.append(type, files[i], files[i].name);
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

}
