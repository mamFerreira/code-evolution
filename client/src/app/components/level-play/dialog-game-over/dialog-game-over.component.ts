import { Component, OnInit, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { GameState } from '../../../class/game-state';

@Component({
  selector: 'app-dialog-game-over',
  templateUrl: './dialog-game-over.component.html',
  styleUrls: ['./dialog-game-over.component.css'],
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

export class DialogGameOverComponent implements OnInit {
  
  @Input() stateGame: GameState;
  @Input() evolution: number;
  @Input() strError: string;
  @Output() doAction: EventEmitter<number> = new EventEmitter<number>();

  constructor() { }

  ngOnInit() { }

  reload() {
    this.doAction.emit(0);
  }

  close() {
    this.stateGame = 0;
  }
}
