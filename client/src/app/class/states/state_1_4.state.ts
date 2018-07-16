import { MainState } from './main.state';

import { Configure } from '../configure.class';
import { Position } from '../position.class';
import { Size } from '../size.class';
import { LevelGoal } from '../../models/level_goal.model';

export class State extends MainState {    

    constructor(health: number, time: number, goals: Array<LevelGoal>) {

        let c = new Configure(goals);  

        c.markedPosition = true;
        c.timeMax = time;
        c.healthMax = health;        
        c.fileMap = 'map1_4.json';
        c.filePlayer = 'player_1.png';
        c.fileTiledSet = 'tiledset_1.png';
        c.positionInit = new Position (423, 360);
        c.sizePlayer = new Size (32, 32);        

        c.addPosition(423, 30);
        c.addPosition(323, 30);
        c.addPosition(323, 360);
        c.addPosition(223, 360);
        c.addPosition(223, 30);
        c.addPosition(123, 30);                  
        c.addPosition(123, 360);  
        c.addPosition(23, 360);          

        super(c);
    }
}
