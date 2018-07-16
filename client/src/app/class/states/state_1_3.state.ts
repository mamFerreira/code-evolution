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
        c.fileMap = 'map1_3.json';
        c.filePlayer = 'player_1.png';
        c.fileTiledSet = 'tiledset_1.png';
        c.positionInit = new Position (410, 25);
        c.sizePlayer = new Size (32, 32);        

        c.addPosition(330, 25);
        c.addPosition(330, 80);
        c.addPosition(160, 80);
        c.addPosition(160, 200);
        c.addPosition(60, 200);                  

        super(c);
    }
}
