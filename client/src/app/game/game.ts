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
import { StateCell } from '../states/state-cell';

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
        // this.game.paused = false;
        _interpreter.run(code);    
    }
}

export class InterpreterJS {
    _interpreter: Interpreter;
    _locked: boolean;
    _waiting: boolean;
    _time: number;
    _evolution: number;

    constructor(evolution: number) {
        this._evolution = evolution;
        this._locked = false;
        this._waiting = false;
        this._time = 0;        
    }

    get locked() {
        return this._locked;
    }

    set locked(value) {
        this._locked = value;
    }

    get waiting() {
        return this._waiting;
    }

    set waiting(value) {
        this._waiting = value;
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
        this._interpreter = new Interpreter(code, initApi);
        this.nextStep();
    }

    nextStep() {

        const timeDefault = 100;

        if (this.waiting) {
            setTimeout(() => {
                this.nextStep();       
            }, timeDefault);
        } else {
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
        }
    }
}


function initApi(i, s) {
    let wrapper;
  
    if (_interpreter.evolution > 0) {
        wrapper = function() {
            _interpreter.locked = true;
            _interpreter.time = 10000;
            return _state.obtenerValor();
        };
            i.setProperty(s, 'obtenerValor', i.createNativeFunction(wrapper));
    }

    if (_interpreter.evolution > 0) {
        wrapper = function(value) {
            _interpreter.locked = true;
            _interpreter.time = 100;
        return _state.imprimirValor(value);
        };
        i.setProperty(s, 'imprimirValor', i.createNativeFunction(wrapper));
    }
}
