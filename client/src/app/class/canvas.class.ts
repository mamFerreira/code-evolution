import { Level } from '../models/level.model';
import { Checker} from './checker.class';
import { ActionEnum } from '../enum/action.enum';
import { StateEnum } from '../enum/state.enum';
import { GoalEnum } from '../enum/goal.enum';
import { GLOBAL } from './../enum/global.enum';
import { Food } from './food.class';


// Declaramos la clase
export class Canvas {   
    
    private level: Level;
    private phaser;    
    private checker: Checker;
    private worker: Worker;     
    private _idIntervalM; 
    private _idIntervalB;       
    private soundLU;  
    private soundGO; 
    private workerFinish: boolean;
      
    public console: string;    
    public messageGO: string;
    public path: string;

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
        this.loadWorker();        
        
    }

    get state(): StateEnum {        
        return this.phaser != null ? this.phaser.state : StateEnum.READY;
    }

    goalCheck(key: string): number {
        return this.phaser.configure != null ? this.phaser.configure.goals[GoalEnum[key]].overcome : -1;                       
    }    

    doAction (action: ActionEnum, code: string = null) {         
        switch (action) { 
            case ActionEnum.RELOAD:  
                this.phaser.reload();                    
                this.finish();                    
                this.console = '';  
                this.messageGO = '';  
                this.workerFinish = false;                              
                break;
            case ActionEnum.PLAY:                  
                this.checkGoals(code);                                                
                this.addConsole('Play...');
                this.postMessage('execute', code);
                this.phaser.state = StateEnum.RUNNING;
                this._idIntervalM = setInterval(() => {                                        
                    if (this.phaser.state === StateEnum.LEVELUP) { 
                        this.soundLU.play();                                                                 
                        this.finish();                        
                        
                    } else if (this.phaser.state === StateEnum.GAMEOVER) {                                                                   
                        this.soundGO.play();  
                        if (!this.workerFinish) {
                            this.addConsole('Error: ' + this.phaser.messageGO, true);                        
                            this.finish();
                        } else {
                            clearInterval(this._idIntervalB);
                            clearInterval(this._idIntervalM);
                        }                                             
                    }                                                            
                }, 50);                                                    
                break;                
            case ActionEnum.PAUSE:                                                
                this.addConsole('Pause');
                this.phaser.state = StateEnum.PAUSED;
                break;
            case ActionEnum.CONTINUE:                         
                this.addConsole('Continue');
                this.phaser.state = StateEnum.RUNNING;
                break;
            case ActionEnum.STOP:      
                this.soundGO.play();                                    
                this.phaser.state = StateEnum.GAMEOVER;
                this.finish();
                break;
            case ActionEnum.VOLUMEN_ON:                
                this.phaser.changeVolume();
                this.soundLU.volume = 0.2;        
                this.soundGO.volume = 0.2;             
                break;
            case ActionEnum.VOLUMEN_OFF:                
                this.phaser.changeVolume();
                this.soundLU.volume = 0;        
                this.soundGO.volume = 0;             
                break;
        }
    }    

    //#region PRIVADOS

    private loadAudio() {
        this.soundLU = new Audio(this.path + GLOBAL.PATH_AUDIO + 'level-up.mp3');            
        this.soundGO = new Audio(this.path + GLOBAL.PATH_AUDIO + 'game-over.mp3');
        this.soundLU.volume = 0.2;        
        this.soundGO.volume = 0.2;           
        this.soundLU.load();        
        this.soundGO.load();        
    }

    private addConsole (msg, error = false) {
        this.console += '<br>$ ' + msg;

        if (error) {            
            this.messageGO = msg;
        }

    }

    private error(msg) {
        if (this.phaser.state !== StateEnum.GAMEOVER) {
            this.phaser.state = StateEnum.GAMEOVER;
        } 

        this.addConsole('Error:' + msg, true);                                     
    }

    private finish () {
        this.postMessage('finish', true);        
        clearInterval(this._idIntervalB);
        clearInterval(this._idIntervalM);
    }

    private checkGoals(code: string = '') {
                                      
        if (this.phaser.configure.goals[GoalEnum.NO_OPERATOR].active) {
            if (code.indexOf(this.phaser.configure.goals[GoalEnum.NO_OPERATOR].value_1) >=  0) {
                this.phaser.configure.goals[GoalEnum.NO_OPERATOR].overcome = 0;                
            } else {
                this.phaser.configure.goals[GoalEnum.NO_OPERATOR].overcome = 1;                
            }
        }

        if (this.phaser.configure.goals[GoalEnum.OPERATOR].active) {            
            if (code.indexOf(this.phaser.configure.goals[GoalEnum.OPERATOR].value_1) < 0) {
                this.phaser.configure.goals[GoalEnum.OPERATOR].overcome = 0;                
            } else {
                this.phaser.configure.goals[GoalEnum.OPERATOR].overcome = 1;                
            }
        }        

        if (this.phaser.configure.goals[GoalEnum.LINES].active) {
            if (code.split('\n').length > +this.phaser.configure.goals[GoalEnum.LINES].value_1) {
                this.phaser.configure.goals[GoalEnum.LINES].overcome = 0;                
            } else {
                this.phaser.configure.goals[GoalEnum.LINES].overcome = 1;                
            }
        }            
    }

    //#endregion PRIVADOS
        
    //#region WORKER

    loadWorker () {

        let actionJson = [];
        this.worker = new Worker(this.path + GLOBAL.PATH_JS + 'worker.js');  

        // Cargamos las acciones disponibles del nivel en el worker        
        this.level.actions.forEach((action, index) => {            
            actionJson.push({'method' : action.shortName} );  
            
            if (index === this.level.actions.length - 1) {
                this.postMessage('init', actionJson);
            }
            
        });                
                
        this.addEventListener(); 
    }

    postMessage(action, value) {
        this.worker.postMessage({'action': action, 'value': [value]});
    } 

    addEventListener() {
        this.worker.addEventListener('message', (e) => {            
            
            // Tipo de acciones: Básicas, movimiento, objetos, comunicación
            switch (e.data.action) {
                case 'moverArriba':
                    this.phaser.wait = true;
                    this.phaser.moveDirection('U');
                    break;
                case 'moverAbajo':
                    this.phaser.wait = true;
                    this.phaser.moveDirection('D');
                    break;
                case 'moverIzquierda':
                    this.phaser.wait = true;
                    this.phaser.moveDirection('L');
                    break;
                case 'moverDerecha':
                    this.phaser.wait = true;
                    this.phaser.moveDirection('R');
                    break;
                case 'mover':                
                    this.phaser.wait = true;
                    this.move(e.data.value);
                    break;
                case 'x':
                    this.postMessage('loadValue', this.phaser.position.x);             
                    break;                    
                case 'y':
                    this.postMessage('loadValue', this.phaser.position.y);             
                    break;                     
                case 'buscarComida':                       
                    this.postMessage('loadValue', this.phaser.findNearestFood());             
                    break;                               
                case 'comer':
                    this.phaser.wait = true;
                    this.phaser.eat();
                    break;
                case 'buscarObjeto':
                    this.postMessage('loadValue', this.phaser.findNearestObject());             
                    break;                    
                case 'coger':
                    this.phaser.wait = true;
                    this.phaser.take();
                    break;
                case 'tirar':
                    this.phaser.wait = true;
                    this.phaser.discard();
                    break;                    
                case 'almacenar':                         
                    this.phaser.wait = true;
                    this.phaser.store();           
                    break;
                case 'alimentar':
                    this.phaser.wait = true;
                    this.phaser.feed();
                    break;
                case 'preguntar':
                    this.postMessage('loadValue', this.phaser.ask());  
                    break;
                case 'ver':
                    this.postMessage('loadValue', e.data.action);  
                    break;
                case 'escuchar':
                    this.postMessage('loadValue', e.data.action);  
                    break;
                case 'hablar':
                    this.addConsole(e.data.value[0]);
                    break;
                case 'print':                
                    this.addConsole(e.data.value[0]);
                    break;
                case 'printArray':
                    this.printArray(e.data.value);
                    break;
                case 'finish':   
                    this.workerFinish = true;                 
                    this.error('Ejecución finalizada sin contemplar los objetivos');
                    break;
                case 'error':
                    this.error(e.data.value);
                    break;
                default:
                    this.error ('Acción ' + e.data.action + ' no definida');
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

    private printArray(value) { 
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
        this.addConsole(v);
    }

    private move(value) {
        if (! this.checker.checkArray(value, 2)) {
            this.error('No ha pasado las coordenadas x e y a la acción "move"');
            return;
        }          

        if (! this.checker.checkIntPos(value[0]) || !this.checker.checkIntPos(value[1])) {
            this.error('Los valores de la acción "move" no son enteros positivos');
            return;
        }
        this.phaser.move (value[0], value[1]); 
    }

    //#endregion WORKER
}
