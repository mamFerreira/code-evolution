import { MainState } from './main.state';
import { GLOBAL } from '../../enum/global.enum';

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
        c.fileMap = 'map3_1.json';
        c.filePlayer = 'player_3.png';
        c.fileTiledSet = 'tiledset_3.png';
        c.positionInit = new Position (30, 190);
        c.sizePlayer = new Size (45, 34);        

        c.addPosition(30, 190);         
        c.addPosition(350, 190);             

        super(c);              
    }

    preload() {
        super.preload();
        this.game.load.image('food_amphibian', GLOBAL.PATH_RESOURCE + 'food/food_amphibian.png');                
    }

    create() {     
        super.create();                    
    }

    update() {                     

        if (this.groupFood.length === 0) {
            if (this.position.inRange(this.configure.positionInit.x, this.configure.positionInit.y)) {
                this.addFoodGroup(this.configure.positionsChecked[1], 'food_amphibian');                
            }
        }

        super.update();
    }
}
