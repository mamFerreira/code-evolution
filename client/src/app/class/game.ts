// Importación Modelos
import { User } from '../models/user.model';
import { Evolution } from '../models/evolution.model';
import { Level } from '../models/level.model';
import { LevelGoal } from '../models/level_goal.model';
import { LevelAction } from '../models/level_action.model';
import { Position } from '../models/position.model';

// Importación de servicios
import { UserService } from '../services/user.service';
import { LevelService } from '../services/level.service';

// Importación de clases
import { Checker} from './checker';
import { GameAction } from '../enum/game-action';
import { GameState } from '../enum/game-state';


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

            switch (e.data.action) {            
                case 'moveDown':
                    this._state.moveDirection('D');                                                     
                    break;
                case 'moveUp': 
                    this._state.moveDirection('U');                                                       
                    break;
                case 'moveRight':
                    this._state.moveDirection('R');                                                        
                    break;
                case 'moveLeft':
                    this._state.moveDirection('L');                                                        
                    break;
                case 'move':
                    if (! this._checker.checkArray(e.data.value, 2)) {
                        this.registerError('No ha pasado las coordenadas x e y a la acción "move"');
                        return;
                    }          
                    
                    if (! this._checker.checkIntPos(e.data.value[0]) || !this._checker.checkIntPos(e.data.value[1])) {
                        this.registerError('Los valores de la acción "move" no son enteros positivos');
                        return;
                    }
                    this._state.move (e.data.value[0], e.data.value[1]);                                        
                    break;
                case 'eat':
                    this._state.eat();
                    break;
                case 'food':                     
                    this.postMessage('loadValue', this._state.foodCurrent);
                    break;
                case 'position':
                    this.postMessage('loadValue', this._state.position());
                    break;
                case 'findNearestFood':
                    this.postMessage('loadValue', this._state.findNearestFood());
                    break;
                case 'existsFood':
                    this.postMessage('loadValue', this._state.existsFood());     
                    break;               
                case 'print':
                    this.addCodeShell(e.data.value[0]);
                    break;
                case 'printArray':
                    let index = 0;
                    let v = '(';
                    while (e.data.value[0][index]) {
                        v += e.data.value[0][index];
                        index += 1;
                        if (e.data.value[0][index]) {
                            v += ', ';
                        }
                    } 
                    v +=  ')';   
                    this.addCodeShell(v);
                    break;
                case 'finish':
                    this.registerError('Ejecución finalizada sin contemplar los objetivos');
                    break;
                case 'error':
                    this.registerError(e.data.value);
                    break;
                default:                
                    this.registerError ('Acción ' + e.data.action + ' no definida');
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
                this.postMessage('execute', code);                
                this.addCodeShell('Play...');
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
