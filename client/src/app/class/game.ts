// Importación Phaser
import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';
// Importación Modelos
import { Level } from '../models/level.model';
import { Evolution } from '../models/evolution.model';
// Importación de los estados
import { StateMain } from './state-main';

export class Game {

    private level: Level;
    private evolution: Evolution;
    private game: Phaser.Game;  
    private state: StateMain;    
    private worker: Worker;  

    constructor (level: Level, evolution: Evolution, id: string) {
        this.level = level;
        this.evolution = evolution;
        this.game = new Phaser.Game('100%', '100%', Phaser.CANVAS, id); 
        this.state = new StateMain(this.game, this.evolution.order, this.level.order);
        this.defineWorker();
        this.game.state.add('gameplay', this.state);
        this.game.state.start('gameplay');
    }

    defineWorker() {
        this.worker = new Worker('../../assets/js/worker.js');

        // Añadimos el mensaje de escucha: Switch con case para la action.
        // En cada action llamaremos a la función correspondiente (de state si es el caso)
        // y el post Message con la información solicitada si es el caso
        this.worker.addEventListener('message', (e) => {

            let idInterval;
            
            switch (e.data.action) {
                case 'moveUp':
                    this.state.moveDirection('U');                
                    break;
                case 'moveDown':
                    this.postMessage('loadValue', this.state.moveDirection('D'));
                    break;
                case 'moveRight':
                    this.state.moveDirection('R');

                    idInterval = setInterval(() => {
                        if (!this.state._posO.active) {
                            this.postMessage('loadValue', true);
                            clearInterval(idInterval);                            
                        }                        
                    }, 500);
                    break;

                case 'moveLeft':
                    this.state.moveDirection('L');

                    idInterval = setInterval(() => {
                        if (!this.state._posO.active) {
                            this.postMessage('loadValue', true);
                            clearInterval(idInterval);                            
                        }                        
                    }, 500);
                    break;

                case 'printValue':
                    this.state.imprimirValor(e.data.value);
                    break;
                case 'error':
                    alert('Error: ' + e.data.value);
                    break;
                default:
                    console.log('Error en worker: Acción no definida');
            }
        }, false);

        // Añadimos información necesaria en el Worker como por ejemplo el id de la evolución
        this.postMessage('initValue', this.evolution.order);
    }

    postMessage(action, value) {
        this.worker.postMessage({'action': action, 'value': [value]});
    } 

    executeCode(code: string) {
        this.postMessage('execute', code);
        // this.game.paused = false;                  
    }

    stopExecution () {
    }
}
