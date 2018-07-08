import { MainState } from './main.state';

import { Configure } from '../configure.class';
import { Position } from '../position.class';
import { Size } from '../size.class';
import { LevelGoal } from '../../models/level_goal.model';

export class State extends MainState {    

    constructor(health: number, time: number, goals: Array<LevelGoal>) {

        let c = new Configure();  

        c.timeMax = time;
        c.healthMax = health;
        c.goals = goals;

        c.fileMap = 'map1_1.json';
        c.filePlayer = 'player_1.png';
        c.fileTiledSet = 'tiledset_1.png';

        c.positionPlayer = new Position (25, 25);
        c.sizePlayer = new Size (32, 32);

        c.addPosition(25, 25);
        c.addPosition(150, 30);
        c.addPosition(290, 30);
        c.addPosition(290, 130);
        c.addPosition(150, 130);
        c.addPosition(150, 230);
        c.addPosition(150, 330);
        c.addPosition(290, 330);
        c.addPosition(400, 330);

        super(c);
    }
    
}
