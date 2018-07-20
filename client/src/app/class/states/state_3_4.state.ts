import { MainState } from './main.state';
import { GLOBAL } from '../../enum/global.enum';

import { Configure } from '../configure.class';
import { Position } from '../position.class';
import { Region } from '../region.class';
import { Size } from '../size.class';
import { LevelGoal } from '../../models/level_goal.model';

export class State extends MainState {     

    private positionsF: Array<Position>;            

    constructor(health: number, time: number, goals: Array<LevelGoal>) {

        let c = new Configure(goals);  

        c.markedPosition = true;
        c.timeMax = time;
        c.healthMax = health;        
        c.fileMap = 'map3_4.json';
        c.filePlayer = 'player_3.png';
        c.fileTiledSet = 'tiledset_3.png';
        c.positionInit = new Position (225, 270);
        c.sizePlayer = new Size (45, 34);        
        c.addPosition(225, 270);                 
        
        super(c); 
        
        // Definimos las variables del nivel                  
        this.positionsF = new Array<Position>();
        
        for (let i = 50; i <= 200; i = i + 75) {
            for (let j = 80; j <= 400; j = j + 100) {
                this.positionsF.push(new Position(j, i));     
            }
        }                
    }

    reload() {        
        super.reload();
        this.positionsF.forEach( (element) => {
            this.addFoodGroup(element, 'food_amphibian');            
        });
    }

    preload() {
        super.preload();
        this.game.load.image('food_amphibian', GLOBAL.PATH_RESOURCE + 'food/food_amphibian.png');                        
    }

    create() {     
        super.create();                          
        
        this.positionsF.forEach( (element) => {
            this.addFoodGroup(element, 'food_amphibian');            
        });
    }

    update() {                    
        super.update();
    }
}
