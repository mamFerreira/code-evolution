import { Component, OnInit, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { GameState } from '../../../class/game-state';

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
  @Input() level: number;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor() {    
  }

  ngOnInit() {      
  }

  close() {    
  }
}
