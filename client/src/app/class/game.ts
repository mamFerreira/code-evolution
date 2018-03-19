import { StateMain, StateState } from './state-main';

// Importación Modelos
import { Evolution } from '../models/evolution.model';
import { Level } from '../models/level.model';
import { LevelGoal } from '../models/level_goal.model';
import { LevelAction } from '../models/level_action.model';
import { Position } from '../models/position.model';

export enum StateGame {
    Init,
    Run,
    Pause,
    Stop,
    Finish_ok,
    Finish_fail
}

export class Game {    
    private state: StateMain;    
    private worker: Worker;
    private idInterval;
    private idIntervalMain;  

    public code_shell: string;
    public code_error: boolean;
    public stateGame: StateGame;
    public volume: boolean;

    constructor (id: string, url: string) {        
        this.state = new StateMain(id, url);
        this.code_shell = 'Code Evolution Shell...';
        this.code_error = false;
        this.stateGame = StateGame.Init;
        this.volume = true;        
    }
    
    initState( level: Level, evolution: Evolution, goals: LevelGoal[], positions: Position[] ): boolean {
        this.state.fileMap = level.map;
        this.state.maxTime = level.time;
        this.state.filePlayer = evolution.player;
        this.state.fileTiledset = evolution.tiledset;   
        this.state.maxLife = evolution.health;     

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
        this.addEventListener();               

        return true;
    }

    postMessage(action, value) {
        this.worker.postMessage({'action': action, 'value': [value]});
    } 

    addEventListener() {
        this.worker.addEventListener('message', (e) => {

            let waitUnblock = false;
            let waitResponse = false;
            switch (e.data.action) {
                case 'moveDown':
                    this.state.moveDirection('D');
                    waitUnblock = true;                                     
                    break;
                case 'moveUp':
                    this.state.moveDirection('U');
                    waitUnblock = true;                                     
                    break;
                case 'moveRight':
                    this.state.moveDirection('R');
                    waitUnblock = true;                                     
                    break;
                case 'moveLeft':
                    this.state.moveDirection('L');
                    waitUnblock = true;                                     
                    break;
                case 'printValue':
                    this.state.imprimirValor(e.data.value);
                    break;
                case 'error':
                    this.code_shell += '<br>$ Error:' + e.data.value;
                    this.stop();
                    break;
                default:
                    this.code_shell += '<br>$ Error en worker: Acción ' + e.data.action + ' no definida';
                    this.stop();
            }

            if (waitUnblock) {
                this.idInterval = setInterval(() => {
                    if (this.state.state === StateState.Playable) {
                        this.postMessage('unblock', true);
                        clearInterval(this.idInterval);                            
                    }                        
                }, 500);
            }

            if (waitResponse) {
                this.idInterval = setInterval(() => {
                    if (!this.state.response) {
                        this.postMessage('loadValue', true);
                        clearInterval(this.idInterval);                            
                    }                        
                }, 500);
            }
            

        }, false); 
    }

    restart () {                
        this.state.game.paused = true;
        this.postMessage('finish', true);        
        clearInterval(this.idInterval);
        clearInterval(this.idIntervalMain);
    }

    reload () {
        // Recargar estado a posición inicial
        this.state.reload();    
        this.restart();    
        this.stateGame = StateGame.Init;
        this.code_shell = 'Code Evolution Shell...';
        this.code_error = false;
    }

    play(code) {
        this.postMessage('execute', code);
        this.state.game.paused = false;   
        this.stateGame = StateGame.Run; 
        this.code_shell += '<br>$ Play...'; 

        this.idIntervalMain = setInterval(() => {

            if (this.state.state > 1) {                                          

                if (this.state.state === StateState.LevelUp) {
                    this.stateGame = StateGame.Finish_ok;
                } else {
                    this.stateGame = StateGame.Finish_fail;
                }                
                this.restart(); 
            }      

        }, 50);

    }

    continue() {
        this.state.game.paused = false;
        this.stateGame = StateGame.Run;
        this.code_shell += '<br>$ Continue...'; 
    }

    pause() {
        this.state.game.paused = true;
        this.stateGame = StateGame.Pause;
        this.code_shell += '<br>$ Pause'; 
    }

    stop() {
        this.restart();
        this.stateGame = StateGame.Stop;
        this.code_shell += '<br>$ Stop: Corrija y recarga para volver a intentarlo'; 
        this.code_error = true;
    }

    volumeOn () {
        console.log('volumeOn');
        this.volume = true;
    }
    
    volumeOff () {    
        console.log('volumeOff');
        this.volume = false;
    }
}
