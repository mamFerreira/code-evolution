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
        c.fileMap = 'map1_2.json';
        c.filePlayer = 'player_1.png';
        c.fileTiledSet = 'tiledset_1.png';
        c.positionInit = new Position (220, 80);
        c.sizePlayer = new Size (32, 32);        

        c.addPosition(220, 25);
        c.addPosition(380, 25);
        c.addPosition(380, 130);
        c.addPosition(380, 230);
        c.addPosition(220, 230);
        c.addPosition(220, 330);
        c.addPosition(50, 330);
        c.addPosition(50, 230);                       

        super(c);
    }
}
