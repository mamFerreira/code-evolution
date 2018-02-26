// Importación Phaser
import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';

import { Level } from '../models/level.model';
import { Evolution } from '../models/evolution.model';

// Importación de los estados
import { StateCell } from '../states/state-cell';

export class Game {

    private level: Level;
    private evolution: Evolution;
    private game: Phaser.Game;
    private state: StateCell;

    constructor (level: Level, evolution: Evolution, id: string) {
        this.level = level;
        this.evolution = evolution;
        this.game = new Phaser.Game('100', 384, Phaser.CANVAS, id);
        
        switch (this.evolution.order) { 
            case 1: { 
                this.state = new StateCell(this.game, level);
                break; 
            } 
        }

        this.game.state.add('gameplay', this.state);
        this.game.state.start('gameplay');
    }

    executeCode(code: string) {
        // const typedWorker: ITypedWorker<string, number> = createWorker(this.workFn, this.logFn);
        // typedWorker.postMessage(code);  
        Promise.all([this.workFn(code)]);
        console.log('Hola Mundo');
    }

    workFn(code: string) {               
        eval(code);        
    }

    logFn(result: number) {
        console.log(`We received this response from the worker: ${result}`);
    }
}


/*
for (var i=0; i<1000 ; i++){
    this.state.moveRight(1);    
}

for (var i=0; i<1000 ; i++){
    this.state.moveRight(2);    
}

*/
