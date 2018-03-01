// Importación Phaser
import 'phaser-ce/build/custom/pixi';
import 'phaser-ce/build/custom/p2';
import * as Phaser from 'phaser-ce/build/custom/phaser-split';
// Importación Interpreter
import { Interpreter } from '../../assets/js/acorn_interpreter';
// Importación Modelos
import { Level } from '../models/level.model';
import { Evolution } from '../models/evolution.model';
// Importación de los estados
import { StateCell } from './states/state-cell';

let _state: any;
let _interpreter: InterpreterJS;

export class Game {

    private level: Level;
    private evolution: Evolution;
    private game: Phaser.Game;        

    constructor (level: Level, evolution: Evolution, id: string) {
        this.level = level;
        this.evolution = evolution;
        this.game = new Phaser.Game('100', 384, Phaser.CANVAS, id); 
        _interpreter = new InterpreterJS (this.evolution.order);
        
        switch (this.evolution.order) { 
            case 1: { 
                _state = new StateCell(this.game, level);
                break; 
            } 
        }

        this.game.state.add('gameplay', _state);
        this.game.state.start('gameplay');
    }

    executeCode(code: string) {
        this.game.paused = false;
        _interpreter.run(code);    
    }

    stopExecution () {
        _interpreter.stop();
        _state.reload();
    }
}

export class InterpreterJS {
    _interpreter: Interpreter;
    _locked: boolean;    
    _time: number;
    _evolution: number;
    _stopped: boolean;

    constructor(evolution: number) {
        this._evolution = evolution;                        
    }

    init () {
        this._locked = false;
        this._stopped = false;        
        this._time = 0;
    }

    get locked() {
        return this._locked;
    }

    set locked(value) {
        this._locked = value;
    }

    get time() {
        return this._time;
    }

    set time(value) {
        this._time = value;
    }

    get evolution() {
        return this._evolution;
    }

    set evolution(value) {
        this._evolution = value;
    }

    run (code: string) {
        this.init();               
        this._interpreter = new Interpreter(code, initApi);
        this.nextStep();        
    }

    stop () {
        this._stopped = true;        
        delete this._interpreter;
    }

    nextStep() {

        const timeDefault = 100;        
        if (!this._stopped) {
            if (_state.locked ) {
                setTimeout(() => {
                    this.nextStep();       
                }, timeDefault);
            } else {                
                try {
                    if (this._interpreter.step()) {
                        if (this._locked) {
                            setTimeout(() => {
                                this._locked = false;
                                this.nextStep();
                            }, this._time);
                        } else {
                            setTimeout(() => {                        
                                this.nextStep();
                            }, timeDefault);
                        }
                    }
                } catch (error) {
                    alert(error.message);                
                }            
            }   
        }        
    }
}


function initApi(i, s) {
    let wrapper;

    if (_interpreter.evolution > 0) {
        wrapper = function() {
            _interpreter.locked = true;
            _interpreter.time = 100;
        return _state.moveDirection('U');
        };
        i.setProperty(s, 'moveUp', i.createNativeFunction(wrapper));

        wrapper = function() {
            _interpreter.locked = true;
            _interpreter.time = 100;
        return _state.moveDirection('D');
        };
        i.setProperty(s, 'moveDown', i.createNativeFunction(wrapper));

        wrapper = function() {
            _interpreter.locked = true;
            _interpreter.time = 100;
        return _state.moveDirection('R');
        };
        i.setProperty(s, 'moveRight', i.createNativeFunction(wrapper));

        wrapper = function() {
            _interpreter.locked = true;
            _interpreter.time = 100;
        return _state.moveDirection('L');
        };
        i.setProperty(s, 'moveLeft', i.createNativeFunction(wrapper));        

        /*wrapper = function() {                         
            let obj = i.createObject(i.OBJECT);
            let enemy = _state.obtenerEnemigo();  
            i.setProperty(obj, 'x', i.createPrimitive(enemy.x));
            return obj;
        };
        i.setProperty(s, 'obtenerEnemigo', i.createNativeFunction(wrapper));*/
    }
}
