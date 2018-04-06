import { Component, OnInit, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';

import { LevelService } from '../../../services/level.service';
import { GameState } from '../../../enum/game-state';


// Servicios

@Component({
  selector: 'app-dialog-level-up',
  templateUrl: './dialog-level-up.component.html',
  styleUrls: ['./dialog-level-up.component.css'],
  animations: [
    trigger('dialog', [
      transition('void => *', [
        style({ transform: 'scale3d(.3, .3, .3)' }),
        animate(100)
      ]),
      transition('* => void', [
        animate(100, style({ transform: 'scale3d(.0, .0, .0)' }))
      ])
    ])
  ]
})

export class DialogLevelUpComponent implements OnInit {

  @Input() stateGame: GameState;  
  @Input() level: string; 
  @Input() evolution: string;   
  @Output() doAction: EventEmitter<number> = new EventEmitter<number>();
  private errorMsg: string;
  private next: boolean;
  private msg: string;
  private msgButton: string;
  private route: string;

  constructor(
    private _levelService: LevelService,
    private _router: Router
  ) {    
    this.errorMsg = '';
    this.msg = '';
    this.msgButton = '';
    this.route = '';
    this.next = false;
  }

  ngOnInit() {      
  }

  reload() {
    this.doAction.emit(0);
  }

  nextWindow() {
    this.next = true;


    this._levelService.nextLevel(this.level).subscribe(
      res => {
          if (res.level) {                                        
              if (res.level.evolution._id === this.evolution) {
                this.route = '/jugar/evolucion/' + res.level.evolution._id;
                this.msg = 'Nuevo nivel desbloquedo!';
                this.msgButton = 'Ver niveles';
              } else {
                this.route = '/jugar';
                this.msg = 'Organismo evolucionado!';
                this.msgButton = 'Ver evoluciones';
              }                
          } else {
            this.route = '/';
            this.msg = 'Juego superado!';
            this.msgButton = 'Salir';
          }      

      },
      err => {
          this.errorMsg += err.error.message;          
      }
    );

  }

  nextLevel() {  
    this._router.navigate([this.route]);     
  }

  close() {
    this.stateGame = 0;
    this.errorMsg = '';
    this.msg = '';
    this.msgButton = '';
    this.route = '';
    this.next = false;
  }
}
