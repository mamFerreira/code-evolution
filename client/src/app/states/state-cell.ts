import { StateMain } from './state-main';
import { Level } from '../models/level.model';


export class StateCell extends StateMain {    

    private level: Level;

    constructor(game, level: Level) {
      super(game);      
      this.level = level;
    }

    preload() {
        super.preload('1', this.level.order.toString());
    }

    create() {
        super.create();        
    }

    update() {
        super.update();
    }

    moveRight(n) {
        console.log ('moveRight: ' + n.toString());
    }

}
