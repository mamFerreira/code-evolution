// Importamos movelos
import { User } from '../models/user.model';
import { Evolution } from '../models/evolution.model';
import { Level } from '../models/level.model';
import { LevelGoal } from '../models/level_goal.model';
import { LevelAction } from '../models/level_action.model';
import { Position } from '../models/position.model';

// Importamos servicios
import { UserService } from '../services/user.service';
import { LevelService } from '../services/level.service';

// Importamos clases
import { Checker} from './checker';
import { GameAction } from '../enum/game-action';
import { GameState } from '../enum/game-state';
import { Food } from './food';

// Declaramos la clase
export class Game {   
    
    // Variables principales
    private _identity;
    private _state;    
    private _worker: Worker;
    private _checker: Checker;  
    private _level: Level;
    private _evolution: Evolution; 
    private _fullLoad: boolean;  
    private _soundLU;  
    private _soundGO;  

    // Variables intervalos
    private _idIntervalM; 
    private _idIntervalB;

    // Variables intercamio de información
    private _codeShell: string;   
    private _msgError: string;       
                             
    constructor (
        private _userService: UserService,
        private _levelService: LevelService,                
    ) {
        this._identity = _userService.getIdentity();        
        this._checker = new Checker();              
        this._codeShell = '';   
        this._msgError = '';   
        // Sonidos de levelUp y gameOver
        this._soundLU = new Audio('../../../assets/audio/sound/level-up.mp3');    
        this._soundGO = new Audio('../../../assets/audio/sound/game-over.mp3'); 
        this._soundLU.volume = 0.2;        
        this._soundGO.volume = 0.2;           
        this._soundLU.load();        
        this._soundGO.load();                         
    }

    // Propiedades

    get stateGame () {
        return this._state.stateGame;
    }

    get codeShell () {
        return 'Code Evolution Shell...' + this._codeShell;
    }

    get msgError () {
        return this._msgError;
    }

    get error () {        
        if (this._msgError.length === 0) {            
            return false;
        } else {            
            return true;
        }
    }

    get goals () {
        return this._state.goals;
    }

    get volume () {
        return this._state.volume;
    }

    // Métodos de carga

    loadState (l: Level, e: Evolution, g: LevelGoal[], p: Position[]) {        
        import('./states/' + l.state).then(s => {
            
            this._level = l;
            this._evolution = e;
            this._state = new s.State();
            
            this._state.loadFile(this._evolution.player, this._level.map, this._evolution.tiledset);    
            this._state.loadConfigure(this._level.time, this._evolution.health, this._evolution.playerW, this._evolution.playerH, this._level.order);        


            g.forEach((g, index) => {    
                this._state.loadGoal(g.goal.title, g.goal.key, g.value1, g.value2);                                       
            });
            
            p.forEach((p) => {
                if (p.initial) {
                    this._state.loadPositionPlayer(p.value_x, p.value_y);
                } else {
                    this._state.loadPosition(p.value_x, p.value_y);
                }  
            });                                   
        });        
    }

    loadWorker (actions: LevelAction[]) {

        let actionJson = [];
        this._worker = new Worker('../../assets/js/worker.js');      
        
        // Cargamos las acciones disponibles del nivel en el worker
        actions.forEach(a => {
            let method = a.action.key;
            actionJson.push({'method' : method} );
        });        

        this.postMessage('initValue', actionJson);
        this.addEventListener(); 
    }

    // Métodos comunicación worker

    postMessage(action, value) {
        this._worker.postMessage({'action': action, 'value': [value]});
    } 

    addEventListener() {
        this._worker.addEventListener('message', (e) => {            

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

            if (this._state.wait) {
                this._idIntervalB = setInterval(() => {
                    if (!this._state.wait) {                                              
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
                this.postMessage('loadValue', this._state.position());
                break;  
            case 'move':
                if (! this._checker.checkArray(value, 2)) {
                    this.registerError('No ha pasado las coordenadas x e y a la acción "move"');
                    return;
                }          
                
                if (! this._checker.checkIntPos(value[0]) || !this._checker.checkIntPos(value[1])) {
                    this.registerError('Los valores de la acción "move" no son enteros positivos');
                    return;
                }
                this._state.move (value[0], value[1]);                                        
                break;
            case 'moveUp': 
                this._state.moveDirection('U');                                                       
                break;
            case 'moveDown':
                this._state.moveDirection('D');
                break;            
            case 'moveLeft':
                this._state.moveDirection('L');                                                        
                break;
            case 'moveRight':
                this._state.moveDirection('R');                                                        
                break;
            default:
                this.registerError ('Acción de movimiento ' + action + ' no definida');
        }
    }

    addEventListeningFood(action, value) {

        let food;

        switch (action) {
            case 'food':                     
                this.postMessage('loadValue', this._state.foodCurrent);
                break;
            case 'existsFood':
                this.postMessage('loadValue', this._state.existsFood());     
                break;
            case 'findNearestFood': 
                this.postMessage('loadValue', this._state.findNearestFood());             
                break;  
            case 'eat':  
            
                if (! this._checker.checkArray(value, 1)) {
                    this.registerError('Acción eat: No ha pasado un objeto de tipo alimento');
                    return;
                }
            
                if (!value[0].hasOwnProperty('id') || !value[0].hasOwnProperty('type') || !value[0].hasOwnProperty('x') || !value[0].hasOwnProperty('y')) {
                    this.registerError('Acción eat: No ha pasado un objeto de tipo alimento');
                    return;
                }   

                food = new Food(value[0].id, value[0].type, value[0].x, value[0].y);                
                this._state.eat(food);
                break;
            case 'discardFood':
                if (! this._checker.checkArray(value, 1)) {
                    this.registerError('Acción eat: No ha pasado un objeto de tipo alimento');
                    return;
                }
            
                if (!value[0].hasOwnProperty('id') || !value[0].hasOwnProperty('type') || !value[0].hasOwnProperty('x') || !value[0].hasOwnProperty('y')) {
                    this.registerError('Acción eat: No ha pasado un objeto de tipo alimento');
                    return;
                }   

                food = new Food(value[0].id, value[0].type, value[0].x, value[0].y);

                this._state.discardFood(food);
                break;
            default:
                this.registerError ('Acción de alimento ' + action + ' no definida');
        }
    }    

    // Métodos principales

    doAction (action: GameAction, code: string = null) {
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
                        this.nextLevel();                                                   
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
    }  

    nextLevel() {
        this._levelService.nextLevel(this._level._id).subscribe(
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
    }

    // Métodos auxiliares    

    addCodeShell (msg, error = false) {
        this._codeShell += '<br>$ ' + msg;

        if (error) {
            this._msgError = msg;
        }

    }

    registerError(msg) {
        this.addCodeShell('Error:' + msg, true);                
        this.doAction(GameAction.Stop);
    }

    finish () {
        this.postMessage('finish', true);        
        clearInterval(this._idIntervalB);
        clearInterval(this._idIntervalM);
    }

}
