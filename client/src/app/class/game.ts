import { StateMain } from './state-main';

// Importación Modelos
import { Evolution } from '../models/evolution.model';
import { Level } from '../models/level.model';
import { LevelGoal } from '../models/level_goal.model';
import { LevelAction } from '../models/level_action.model';
import { Position } from '../models/position.model';


export class Game {    
    private state: StateMain;    
    private worker: Worker;  

    constructor (id: string, url: string) {        
        this.state = new StateMain(id, url);
    }
    
    initState( level: Level, evolution: Evolution, goals: LevelGoal[], positions: Position[] ): boolean {
        this.state.fileMap = level.map;
        this.state.filePlayer = evolution.player;
        this.state.fileTiledset = evolution.tiledset;        

        goals.forEach((g, index) => {
            switch (g.goal._id) {
                case '5aa2728a0f97ad1767590448':
                    this.state.addGoal('position', g.value1, g.value2);                     
                    break;
            }            
        });
        
        positions.forEach((p, index) => {
            if (index === 0) {
                this.state.addPosition(p.value_x, p.value_y, true);
            } else {
                this.state.addPosition(p.value_x, p.value_y);
            }  
        });

        this.state.game.state.add('gameplay', this.state);
        this.state.game.state.start('gameplay');
        
        return true;
    }

    defineWorker(actions: LevelAction[]): boolean {

        let actionJson = [];
        this.worker = new Worker('../../assets/js/worker.js');      
        
        // Cargamos las acciones disponibles del nivel en el worker
        actions.forEach(a => {
            let method = a.action.method;            
            let index = method.indexOf('(');
            if (index > 0) {
                method = method.substring(0, index);
            }
            actionJson.push({'method' : method} );
        });        

        this.postMessage('initValue', actionJson);
        

        // Añadimos el mensaje de escucha: Switch con case para la action.
        // En cada action llamaremos a la función correspondiente (de state si es el caso)
        // y el post Message con la información solicitada si es el caso
        this.worker.addEventListener('message', (e) => {

            let idInterval;
            
            switch (e.data.action) {
                /*case 'moveUp':
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
                */
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

        return true;
    }

    postMessage(action, value) {
        this.worker.postMessage({'action': action, 'value': [value]});
    } 

    executeCode(code: string) {
        this.postMessage('execute', code);
        this.state.game.paused = false;                  
    }
}
