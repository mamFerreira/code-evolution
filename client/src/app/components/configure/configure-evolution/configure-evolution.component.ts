import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params} from '@angular/router';

import { GLOBAL } from '../../../enum/global.enum';

import { AlertService } from '../../../services/alert.service';
import { UserService } from '../../../services/user.service';
import { LevelService } from '../../../services/level.service';
import { EvolutionService } from '../../../services/evolution.service';
import { Level } from '../../../models/level.model';
import { Evolution } from '../../../models/evolution.model';

@Component({
  selector: 'app-configure-evolution',
  templateUrl: './configure-evolution.component.html',
  styleUrls: ['./configure-evolution.component.css']
})
export class ConfigureEvolutionComponent implements OnInit {

  public title: string;
  public url: string;
  public identity;
  public file: Array<File>;
  public evolution: Evolution;
  public levels: Level[];
  public isEdit: boolean;
  
  constructor(    
    private _alertService: AlertService,
    private _userService: UserService,
    private _evolutionService: EvolutionService,
    private _levelService: LevelService,
    private _route: ActivatedRoute    
  ) { 
    this.title = 'Editar evolución';
    this.url = GLOBAL.URL_API;
    this.identity = this._userService.getIdentity();
    this.isEdit = true;    
  }


  ngOnInit() {
    this._route.params.forEach((params: Params) => {              
      if (params['id']) {            
        this._evolutionService.getEvolutions(params['id']).subscribe(
          res => {
            if (!res.evolutions || res.evolutions.length === 0) {
              this._alertService.error(res.message); 
            } else {
              this.evolution = res.evolutions[0];  
              this.getLevels(this.evolution._id);
            }
          },
          err => {
            this._alertService.error(err.error.message);
          }
        );        
      } else {
        this.isEdit = false;
        this.title = 'Añadir evolución';
        this.evolution = new Evolution (null, null, '', '', '', null, '', null);
      }      
    });    
  }


  getLevels (id: string) {
    this._levelService.getLevelsEvolution(id).subscribe(
      res => {
        if (!res.levels) {
          this._alertService.error(res.message); 
          this.evolution.levels = [];
        } else {
          this.evolution.levels = res.levels;                      
        }
      },
      err => {
        this.evolution.levels = [];
        this._alertService.error(err.error.message);
      }
    );
  }


  fileChangeEvent(fileInput: any) {     
    this.file = <Array<File>> fileInput.target.files;           
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
    if (this.isEdit) {
      this._evolutionService.updateEvolution(this.evolution).subscribe(
        res => {
          if (!res.evolution) {
            this._alertService.error(res.message); 
          } else {        
            if (this.file) {
              this.makeFileRequest(this.url + 'evolution-upload/' +  this.evolution._id, [], this.file).then(
                (res: any) => {
                    if (res.image) {
                      this.evolution.image = res.image;
                    } else {
                      this._alertService.error(res.message);                       
                    }                       
                }
              ); 
            }                      
            this._alertService.success('Evolución actualizada correctamente');
          }
        },
        err => {
          this._alertService.error(err.error.message);
        }
      );
    } else {
      this._evolutionService.addEvolution(this.evolution).subscribe(
        res => {
          if (!res.evolution) {
            this._alertService.error(res.message);
          } else {            
            this._alertService.success('Evolución creada correctamente');        
          }
        },
        err => {
          this._alertService.error(err.error.message);
        }
      );
    }
  }
}
