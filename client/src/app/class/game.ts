import { StateMain } from './state-main';
import { GameAction } from '../enum/game-action';
import { GameState } from '../enum/game-state';

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

export class Game {    
    private state: StateMain;    
    private worker: Worker;
    private checked: CheckData;
    private _identity;
    private _levelService: LevelService; 
    private _userService: UserService;   
    private _idLevel: string;
    private idInterval;
    private idIntervalMain; 

    public code_shell: string;
    public code_error: string;
    public is_error: boolean;    
    public volume: boolean;    

    constructor (
        id: string, 
        levelService: LevelService,
        userService: UserService
    ) {        
        this._levelService = levelService;
        this._userService = userService;
        this._identity = userService.getIdentity();
        this.state = new StateMain(id);  
        this.checked = new CheckData();      
        this.code_shell = 'Code Evolution Shell...';
        this.code_error = '';
        this.is_error = false;        
        this.volume = true;                 
    }
    
    initState( level: Level, evolution: Evolution, goals: LevelGoal[], actions: LevelAction[], positions: Position[]) {
        this._idLevel = level._id;
        this.state.fileMap = level.map;
        this.state.timeMax = level.time;
        this.state.filePlayer = evolution.player;
        this.state.fileTiledset = evolution.tiledset;   
        this.state.lifeMax = evolution.health;     


        goals.forEach((g, index) => {    
            this.state.addGoal(g.goal.key, g.value1, g.value2);                                       
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
            let value1, value2;
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
                case 'move':

                    if (! this.checked.checkArray(e.data.value, 2)) {
                        this.registerError('No ha pasado las coordenadas x e y a la acción "move"');
                        return;
                    }          
                    
                    if (! this.checked.checkIntPos(e.data.value[0]) || !this.checked.checkIntPos(e.data.value[1])) {
                        this.registerError('Los valores de la acción "move" no son enteros positivos');
                        return;
                    }
                    this.state.move (e.data.value[0], e.data.value[1]);                    
                    waitUnblock = true;

                    break;
                case 'findNearestFood':
                    this.postMessage('loadValue', this.state.findNearestFood());
                    break;
                case 'print':
                    console.log(e.data.value[0]);
                    break;
                case 'finish':
                    this.registerError('Ejecución finalizada sin contemplar los objetivos');
                    break;
                case 'error':
                    this.registerError(e.data.value);
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

    registerError(message) {
        this.code_shell += '<br>$ Error:' + message;
        this.code_error += 'Error: ' + message;
        this.doAction(GameAction.Stop);
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
                this.code_error = '';
                this.is_error = false; 
                break;
            case GameAction.Play:
                this.state.stateGame = GameState.Run;
                this.postMessage('execute', code);                
                this.code_shell += '<br>$ Play...'; 

                this.idIntervalMain = setInterval(() => {                                        

                    if (this.state.stateGame === GameState.LevelUp) { 
                        this.nextLevel();                                                   
                        this.restart();                        
                    } else if (this.state.stateGame === GameState.GameOver) {
                        this.code_shell += '<br>$ Error -> ' + this.state.code_error;
                        this.code_error = this.state.code_error;
                        this.is_error = true;                        
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
                this.state.stateGame = GameState.GameOver;
                this.restart();
                break;
            case GameAction.ChangeVolume:
                this.volume = !this.volume;
                break;
        }
    }  
    
    nextLevel() {                                          
        this._levelService.nextLevel(this._idLevel).subscribe(
            res => {
                if (!res.level) {
                    this.code_shell += '<br>$ ' + res.message + '!';
                } else { 
                    if (this._idLevel === this._identity.level._id) {                                                     
                        this._identity.level = res.level;                                           
                        localStorage.setItem('identity', JSON.stringify(this._identity)); 
                    }
                }                 
            },
            err => {
                this.code_error += err.error.message;          
            }
        );                
    }
    
    get stateGame () {
        return this.state.stateGame;
    }
}


export class CheckData {

    constructor () { }

    checkArray (array, value) {

        if (array.length !== value) {
            return false;
        }

        for (let i = 0; i < array.length; i++) {
            if (array[i] === undefined) {
                return false;
            }
        }

        return true;
    }

    checkIntPos (value) {
        if (value !== parseInt(value, 10)) {
            return false;
        }

        if (parseInt(value, 10) < 0) {
            return false;
        }

        return true;
    }
}
