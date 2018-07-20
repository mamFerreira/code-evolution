import { MainState } from './main.state';
import { GLOBAL } from '../../enum/global.enum';

import { Configure } from '../configure.class';
import { Position } from '../position.class';
import { Size } from '../size.class';
import { LevelGoal } from '../../models/level_goal.model';

export class State extends MainState {     
        
    private posFood: Array<Position>;

    constructor(health: number, time: number, goals: Array<LevelGoal>) {

        let c = new Configure(goals);  

        c.markedPosition = true;
        c.timeMax = time;
        c.healthMax = health;        
        c.fileMap = 'map2_1.json';
        c.filePlayer = 'player_2.png';
        c.fileTiledSet = 'tiledset_2.png';
        c.positionInit = new Position (225, 192);
        c.sizePlayer = new Size (40, 40);        

        c.addPosition(100, 192);
        c.addPosition(225, 192);
        c.addPosition(350, 192);     
        
        super(c);

        this.posFood = new Array<Position>();
        this.posFood.push(new Position(100, 192));
        this.posFood.push(new Position(350, 192));        
    }

    preload() {
        super.preload();
        this.game.load.image('food_fish', GLOBAL.PATH_RESOURCE + 'food/food_fish.png');                
    }

    create() {     
        super.create();                     
    }

    update() {                     

        if (this.groupFood.length === 0) {
            if (this.position.inRange(this.configure.positionInit.x, this.configure.positionInit.y)) {
                this.addFoodGroup(this.posFood[this.random(0, 1)], 'food_fish');                
            }
        }

        super.update();
    }
}
