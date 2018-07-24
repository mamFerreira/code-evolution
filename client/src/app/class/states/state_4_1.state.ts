import { MainState } from './main.state';
import { GLOBAL } from '../../enum/global.enum';

import { Configure } from '../configure.class';
import { Position } from '../position.class';
import { Size } from '../size.class';
import { Region } from '../region.class';
import { LevelGoal } from '../../models/level_goal.model';

export class State extends MainState {    

    public region: Region;
    public positionBaby: Position;

    constructor(health: number, time: number, goals: Array<LevelGoal>) {

        let c = new Configure(goals);  

        c.markedPosition = true;
        c.timeMax = time;
        c.healthMax = health;        
        c.fileMap = 'map4_1.json';
        c.filePlayer = 'player_4.png';
        c.fileTiledSet = 'tiledset_4.png';
        c.positionInit = new Position (350, 140);
        c.sizePlayer = new Size (40, 40);    
        c.addPosition(350, 140);                                      
        super(c);

        this.region = new Region(new Position(80, 180), new Position(400, 350));
        this.positionBaby = new Position(400, 140);
    }

    reload() {        
        super.reload();
    }

    preload() {
        super.preload();
        this.game.load.image('mammal_baby', GLOBAL.PATH_RESOURCE + 'character/mammal_baby_1.png');                
        this.game.load.image('food_mammal', GLOBAL.PATH_RESOURCE + 'food/food_mammal_1.png');                        
    }

    create() {     
        super.create();    
        this.addSprite(this.positionBaby, 'mammal_baby');
    }

    update() {    
        
        if (this.groupFood.length === 0) {
            if (this.position.inRangeP(this.positionBaby) || this.position.inRangeP(this.configure.positionInit)) {
                let x = this.random(this.region.position1.x, this.region.position2.x);
                let y = this.random(this.region.position1.y, this.region.position2.y);
                this.addFoodGroup(new Position(x, y), 'food_mammal');                
            }
        }
        
        super.update();
    }

    feed () {
        if (this.position.inRangeP(this.positionBaby) {
            super.feed();
        } else {
            this.eventGameOver ('No has recogido ningún alimento');
        }
    }
}
