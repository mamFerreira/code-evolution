import { MainState } from './main.state';
import { GLOBAL } from '../../enum/global.enum';

import { Configure } from '../configure.class';
import { Position } from '../position.class';
import { Size } from '../size.class';
import { Region } from '../region.class';
import { LevelGoal } from '../../models/level_goal.model';

export class State extends MainState {    

    public region: Region;
    public positionBabies: Array<Position>;

    constructor(health: number, time: number, goals: Array<LevelGoal>) {

        let c = new Configure(goals);  

        c.markedPosition = true;
        c.timeMax = time;
        c.healthMax = health;        
        c.fileMap = 'map4_2.json';
        c.filePlayer = 'player_4.png';
        c.fileTiledSet = 'tiledset_4.png';
        c.positionInit = new Position (225, 300);
        c.sizePlayer = new Size (40, 40);    
        c.addPosition(75, 85);                                      
        c.addPosition(225, 85); 
        c.addPosition(374, 85); 
        super(c);

        this.region = new Region(new Position(30, 125), new Position(390, 250));
        this.positionBabies = new Array(new Position(70, 50), new Position(220, 50), new Position(370, 50));        
    }

    reload() {        
        super.reload();
    }

    preload() {
        super.preload();
        this.game.load.image('mammal_baby_1', GLOBAL.PATH_RESOURCE + 'character/mammal_baby_1.png');                
        this.game.load.image('mammal_baby_2', GLOBAL.PATH_RESOURCE + 'character/mammal_baby_2.png'); 
        this.game.load.image('mammal_baby_3', GLOBAL.PATH_RESOURCE + 'character/mammal_baby_3.png'); 
        this.game.load.image('bellota', GLOBAL.PATH_RESOURCE + 'food/food_mammal_1.png');                        
        this.game.load.image('seta', GLOBAL.PATH_RESOURCE + 'food/food_mammal_2.png');                        
        this.game.load.image('avellana', GLOBAL.PATH_RESOURCE + 'food/food_mammal_3.png');                                
    }

    create() {     
        super.create();    
        this.addSprite(this.positionBabies[0], 'mammal_baby_1');        
        this.addSprite(this.positionBabies[1], 'mammal_baby_2');        
        this.addSprite(this.positionBabies[2], 'mammal_baby_3');                        
    }

    update() {    
        
        if (this.groupFood.length === 0) {
            let x = this.random(this.region.position1.x, this.region.position2.x);
            let y = this.random(this.region.position1.y, this.region.position2.y);
            let type = this.random(1, 3);  
            
            switch (type) {
                case 1:
                    this.addFoodGroup(new Position(x, y), 'bellota');
                    break;
                case 2:
                    this.addFoodGroup(new Position(x, y), 'seta');
                    break;
                case 3:
                    this.addFoodGroup(new Position(x, y), 'avellana');
                    break;
            }                        
        }
        
        super.update();
    }

    feed () {
                
        if (this.foodBag != null) {

            let existe = false;

            // Bebe 1: Bellota
            if (this.position.inRangeP(this.positionBabies[0], 80)) {
                existe = true;
                if (this.foodBag.type === 'bellota') { 
                    super.feed(this.positionBabies[0]);
                } else {
                    this.eventGameOver('Este no es alimento favorito de este cría. Es la bellota.');
                }
            }

            // Bebe 2: Seta
            if (this.position.inRangeP(this.positionBabies[1], 80)) {
                existe = true;
                if (this.foodBag.type === 'seta') { 
                    super.feed(this.positionBabies[1]);
                } else {
                    this.eventGameOver('Este no es alimento favorito de este cría. Es la seta.');
                }
            }

            // Bebe 3: Avellana
            if (this.position.inRangeP(this.positionBabies[2], 80)) {
                existe = true;
                if (this.foodBag.type === 'avellana') { 
                    super.feed(this.positionBabies[2]);
                } else {
                    this.eventGameOver('Este no es alimento favorito de este cría. Es la avellana.');
                }
            }           

            if (!existe) {
                this.eventGameOver ('No tienes a nadie cerca que alimentar');
            }

        } else {
            this.eventGameOver ('No has recogido ningún alimento');
        }

    }
}
