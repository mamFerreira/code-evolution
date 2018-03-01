import { StateMain } from './state-main';
import { Level } from '../models/level.model';


export class StateCell extends StateMain {    

    private level: Level;
    private x: string;

    constructor(game, level: Level) {
      super(game);      
      this.level = level;
      this.x = 'Funciona correctamente';
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

    position() {        
        return super.player().body.position.x;
    }

    imprimirValor(x) {
        console.log('El valor es: ' + x);
    }

    obtenerValor() {
        return this.x;
    }

}
