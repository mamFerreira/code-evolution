// Importamos movelos
import { User } from '../models/user.model';
import { Evolution } from '../models/evolution.model';
import { Level } from '../models/level.model';
import { LevelGoal } from '../models/level_goal.model';
import { LevelAction } from '../models/level_action.model';

// Importamos servicios
import { UserService } from '../services/user.service';
import { LevelService } from '../services/level.service';

// Importamos clases
import { Checker} from './checker.class';
import { StateEnum } from '../enum/state.enum';
import { GLOBAL } from './../enum/global.enum';
import { Food } from './food.class';


// Declaramos la clase
export class Canvas {   
    
    private level: Level;
    private phaser;    
    private checker: Checker;
    private worker: Worker;     

    private soundLU;  
    private soundGO; 
      
    public console: string;    
    public messageGO: string;
    public path: string;
               

    // Variables intervalos
    private _idIntervalM; 
    private _idIntervalB;           
                             
    constructor ( level: Level) {
        // Variables para el intercambio de información        
        this.console = '';
        this.messageGO = '';
        // Variables principales
        this.level = level;
        this.checker = new Checker();
        this.path = '../../..';
        
        import('./states/state_' + level.evolution.order.toString() + '_' + level.order.toString() + '.state').then(module => {
            this.phaser = new module.State(this.level.evolution.health, this.level.time, this.level.goals);
        }); 

        this.loadAudio();
        // this.loadWorker();        
        
    }

    get state(): StateEnum {        
        return this.phaser != null ? this.phaser.state : StateEnum.READY;
    }

    goalCheck(key): number {

        let resultado = 0;

        switch (key) {
            case 'POSITION': {                
                resultado = 1;
                break;
            }                                
        }
        return resultado;
    }


     // Métodos de carga

    loadAudio() {
        this.soundLU = new Audio(this.path + GLOBAL.PATH_AUDIO + 'level-up.mp3');            
        this.soundGO = new Audio(this.path + GLOBAL.PATH_AUDIO + 'game-over.mp3');
        this.soundLU.volume = 0.2;        
        this.soundGO.volume = 0.2;           
        this.soundLU.load();        
        this.soundGO.load();        
    }

    loadWorker () {

        let actionJson = [];
        this.worker = new Worker(this.path + GLOBAL.PATH_JS + 'worker.js');  

        // Cargamos las acciones disponibles del nivel en el worker        
        this.level.actions.forEach((action, index) => {            
            actionJson.push({'method' : action.shortName} );  
            
            if (index === this.level.actions.length - 1) {
                this.postMessage('initValue', actionJson);
            }
            
        });                
                
        this.addEventListener(); 
    }
    

    // Métodos comunicación worker

    postMessage(action, value) {
        this.worker.postMessage({'action': action, 'value': [value]});
    } 

    addEventListener() {
        this.worker.addEventListener('message', (e) => {            

            switch (e.data.type) {            
                case 'primary':
                    this.addEventListeningPrimary(e.data.action, e.data.value);
                    break;
                case 'position':
                    this.addEventLisneningPosition(e.data.action, e.data.value);
                    break;
                case 'food':
                    this.addEventListeningFood(e.data.action, e.data.value);
                    break;                                                                                                                                       
                case 'finish':
                    this.registerError('Ejecución finalizada sin contemplar los objetivos');
                    break;
                case 'error':
                    this.registerError(e.data.value);
                    break;                
            }

            if (this.phaser.wait) {
                this._idIntervalB = setInterval(() => {
                    if (!this.phaser.wait) {                                              
                        this.postMessage('unblock', true);
                        clearInterval(this._idIntervalB);                            
                    }                        
                }, 500);
            }

        }, false); 
    }

    addEventListeningPrimary(action, value) {
        switch (action) {
            case 'print':
                this.addCodeShell(value[0]);
                break;
            case 'printArray':
                let index = 0;
                let v = '(';
                while (value[0][index]) {
                    v += value[0][index];
                    index += 1;
                    if (value[0][index]) {
                        v += ', ';
                    }
                } 
                v +=  ')';   
                this.addCodeShell(v);
                break;
            default:
                this.registerError ('Acción primaria ' + action + ' no definida');
        }
    }

    addEventLisneningPosition(action, value) {
        switch (action) {
            case 'position':
                this.postMessage('loadValue', this.phaser.position());
                break;  
            case 'move':
                if (! this.checker.checkArray(value, 2)) {
                    this.registerError('No ha pasado las coordenadas x e y a la acción "move"');
                    return;
                }          
                
                if (! this.checker.checkIntPos(value[0]) || !this.checker.checkIntPos(value[1])) {
                    this.registerError('Los valores de la acción "move" no son enteros positivos');
                    return;
                }
                this.phaser.move (value[0], value[1]);                                        
                break;
            case 'moveUp': 
                this.phaser.moveDirection('U');                                                       
                break;
            case 'moveDown':
                this.phaser.moveDirection('D');
                break;            
            case 'moveLeft':
                this.phaser.moveDirection('L');                                                        
                break;
            case 'moveRight':
                this.phaser.moveDirection('R');                                                        
                break;
            default:
                this.registerError ('Acción de movimiento ' + action + ' no definida');
        }
    }

    addEventListeningFood(action, value) {

        let food;

        switch (action) {
            case 'food':                     
                this.postMessage('loadValue', this.phaser.foodCurrent);
                break;
            case 'existsFood':
                this.postMessage('loadValue', this.phaser.existsFood());     
                break;
            case 'findNearestFood': 
                this.postMessage('loadValue', this.phaser.findNearestFood());             
                break;  
            case 'eat':  
            
                if (! this.checker.checkArray(value, 1)) {
                    this.registerError('Acción eat: No ha pasado un objeto de tipo alimento');
                    return;
                }
            
                if (!value[0].hasOwnProperty('id') || !value[0].hasOwnProperty('type') || !value[0].hasOwnProperty('x') || !value[0].hasOwnProperty('y')) {
                    this.registerError('Acción eat: No ha pasado un objeto de tipo alimento');
                    return;
                }   

                food = new Food(value[0].id, value[0].type, value[0].x, value[0].y);                
                this.phaser.eat(food);
                break;
            case 'discardFood':
                if (! this.checker.checkArray(value, 1)) {
                    this.registerError('Acción eat: No ha pasado un objeto de tipo alimento');
                    return;
                }
            
                if (!value[0].hasOwnProperty('id') || !value[0].hasOwnProperty('type') || !value[0].hasOwnProperty('x') || !value[0].hasOwnProperty('y')) {
                    this.registerError('Acción eat: No ha pasado un objeto de tipo alimento');
                    return;
                }   

                food = new Food(value[0].id, value[0].type, value[0].x, value[0].y);

                this.phaser.discardFood(food);
                break;
            default:
                this.registerError ('Acción de alimento ' + action + ' no definida');
        }
    }    

    // Métodos principales

    /* doAction (action: GameAction, code: string = null) {
        switch (action) { 
            case GameAction.Reload:                
                this._state.reload();    
                this.finish();                    
                this._codeShell = '';  
                this._msgError = '';                               
                break;
            case GameAction.Play:
                this._state.stateGame = GameState.Run;                                
                this.addCodeShell('Play...');
                this.postMessage('execute', code);
                
                this._idIntervalM = setInterval(() => {                                        
                    if (this._state.stateGame === GameState.LevelUp) { 
                        this._soundLU.play();
                        //this.nextLevel();                                                   
                        this.finish();                        
                    } else if (this._state.stateGame === GameState.GameOver) {                        
                        this._soundGO.play();                     
                        this.addCodeShell('Error: ' + this._state.msgError, true);                        
                        this.finish();
                    }                                                            
                }, 50);                
                break;                
            case GameAction.Pause:                                                
                this.addCodeShell('Pause');
                this._state.stateGame = GameState.Pause;
                break;
            case GameAction.Continue:                
                this.addCodeShell('Continue');
                this._state.stateGame = GameState.Run;
                break;
            case GameAction.Stop:      
                this._soundGO.play();                    
                this.addCodeShell('Stop: Corrija y recarga para volver a intentarlo');                    
                this._state.stateGame = GameState.GameOver;
                this.finish();
                break;
            case GameAction.ChangeVolume:                
                this._state.changeVolume();

                if (this._state.volume) {
                    this._soundLU.volume = 0.2;        
                    this._soundGO.volume = 0.2; 
                } else {
                    this._soundLU.volume = 0;        
                    this._soundGO.volume = 0; 
                }

                break;
        }
    } */ 

    /*nextLevel() {
        this._levelService.getLevels(this._level._id).subscribe(
            res => {
                if (res.level) {                                                                         
                    if (this._level._id === this._identity.level._id) {                                                     
                        this._identity.level = res.level;                                           
                        localStorage.setItem('identity', JSON.stringify(this._identity)); 
                    }
                }                 
            },
            err => {
                this._msgError = err.message;
            }
        );                
    }*/

    // Métodos auxiliares    

    addCodeShell (msg, error = false) {
        this.console += '<br>$ ' + msg;

        if (error) {
            this.messageGO = msg;
        }

    }

    registerError(msg) {
        this.addCodeShell('Error:' + msg, true);                
        // this.doAction(GameAction.STOPPED);
    }

    finish () {
        this.postMessage('finish', true);        
        clearInterval(this._idIntervalB);
        clearInterval(this._idIntervalM);
    }

}
