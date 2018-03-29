import { StateMain } from './state-main';
import { GameAction } from './game-action';
import { GameState } from './game-state';

// Importación Modelos
import { Evolution } from '../models/evolution.model';
import { Level } from '../models/level.model';
import { LevelGoal } from '../models/level_goal.model';
import { LevelAction } from '../models/level_action.model';
import { Position } from '../models/position.model';

export class Game {    
    private state: StateMain;    
    private worker: Worker;
    private idInterval;
    private idIntervalMain;  

    public code_shell: string;
    public code_error: boolean;    
    public volume: boolean;    

    constructor (id: string, url: string) {        
        this.state = new StateMain(id, url);
        this.code_shell = 'Code Evolution Shell...';
        this.code_error = false;        
        this.volume = true;      
    }
    
    initState( level: Level, evolution: Evolution, goals: LevelGoal[], actions: LevelAction[], positions: Position[]) {
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

        this.defineWorker(actions);
    }

    defineWorker(actions: LevelAction[]) {

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
                    this.doAction(GameAction.Stop);
                    break;
                default:
                    this.code_shell += '<br>$ Error en worker: Acción ' + e.data.action + ' no definida';
                    this.doAction(GameAction.Stop);
            }

            if (waitUnblock) {
                this.idInterval = setInterval(() => {
                    if (!this.state.waitMove) {                        
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
        this.postMessage('finish', true);        
        clearInterval(this.idInterval);
        clearInterval(this.idIntervalMain);
    }

    doAction (action: GameAction, code: string = null) {
        switch (action) { 
            case GameAction.Reload:                
                this.state.reload();    
                this.restart();                    
                this.code_shell = 'Code Evolution Shell...';
                this.code_error = false;                
                break;
            case GameAction.Play:
                this.state.stateGame = GameState.Run;
                this.postMessage('execute', code);                
                this.code_shell += '<br>$ Play...'; 

                this.idIntervalMain = setInterval(() => {                                        

                    if (this.state.stateGame === GameState.LevelUp) {                                                    
                        this.restart();
                    } else if (this.state.stateGame === GameState.GameOver) {
                        this.code_shell += '<br>$ Error -> ' + this.state.code_error;
                        this.code_error = true;                        
                        this.restart();
                    }                                                            
                }, 50);
                break;
            case GameAction.Pause:                                
                this.code_shell += '<br>$ Pause'; 
                this.state.stateGame = GameState.Pause;
                break;
            case GameAction.Continue:                
                this.code_shell += '<br>$ Continue...'; 
                this.state.stateGame = GameState.Run;
                break;
            case GameAction.Stop:                        
                this.code_shell += '<br>$ Stop: Corrija y recarga para volver a intentarlo'; 
                this.code_error = true;                
                this.state.stateGame = GameState.Stop;
                this.restart();
                break;
            case GameAction.ChangeVolume:
                this.volume = !this.volume;
                break;
        }
    }    
    
    get stateGame () {
        return this.state.stateGame;
    }
}
