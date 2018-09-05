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
    public positionMammal: Position;
    public positionNextBaby: Position;    

    constructor(health: number, time: number, goals: Array<LevelGoal>) {

        let c = new Configure(goals);  

        c.markedPosition = true;
        c.timeMax = time;
        c.healthMax = health;        
        c.fileMap = 'map4_3.json';
        c.filePlayer = 'player_4.png';
        c.fileTiledSet = 'tiledset_4.png';
        c.positionInit = new Position (50, 180);
        c.sizePlayer = new Size (40, 40);    
        c.addPosition(175, 85);                                      
        c.addPosition(275, 85); 
        c.addPosition(375, 85); 
        c.addPosition(220, 300);
        super(c);

        this.region = new Region(new Position(120, 120), new Position(400, 270));
        this.positionBabies = new Array(new Position(170, 50), new Position(270, 50), new Position(370, 50));        
        this.positionMammal = new Position(220, 340);
    }

    reload() {        
        super.reload();
    }

    preload() {
        super.preload();
        this.game.load.image('mammal_2', GLOBAL.PATH_RESOURCE + 'character/mammal_2.png');
        this.game.load.image('mammal_baby_1', GLOBAL.PATH_RESOURCE + 'character/mammal_baby_1.png');                
        this.game.load.image('mammal_baby_2', GLOBAL.PATH_RESOURCE + 'character/mammal_baby_2.png'); 
        this.game.load.image('mammal_baby_3', GLOBAL.PATH_RESOURCE + 'character/mammal_baby_3.png'); 
        this.game.load.image('bellota', GLOBAL.PATH_RESOURCE + 'food/food_mammal_1.png');                        
        this.game.load.image('seta', GLOBAL.PATH_RESOURCE + 'food/food_mammal_2.png');                        
        this.game.load.image('avellana', GLOBAL.PATH_RESOURCE + 'food/food_mammal_3.png');                                
    }

    create() {     
        super.create();    
        this.addSprite(this.positionMammal, 'mammal_2');        
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

    ask () {  
        
        if (!this.position.inRangeP(this.positionMammal, 80)) {
            this.eventGameOver('No tienes a nadie cerca para preguntar');
            return;
        }

        if (this.foodBag === null) {
            this.eventGameOver('No has recogido ningún alimento por el que preguntar');
            return;
        }

        let x = this.random(0, 1);
        this.positionNextBaby = this.positionBabies[x];
        let color = '';

        switch (x) {
            case 0:
                color = 'Gris';
                break;
            case 1:
                color = 'Marron';
                break;
            case 2:
                color = 'Naranja';
                break;            
        }

        let _idSprite = this.game.add.sprite(this.positionMammal.x - 50, this.positionMammal.y - 80, 'speech_U_C');
        let _idText = this.game.add.text(this.positionMammal.x - 25, this.positionMammal.y - 65, color + '!' , Configure.stylePositionClick);

        let _id = setInterval(
            () => {   
                _idSprite.kill();                 
                _idText.kill();                                                                                                                                             
                clearInterval(_id);                                                                                          
            }, 1000);                 

        return color;
    }

    feed () {
                
        if (this.foodBag != null) {

            let existe = false;
            
            if (this.position.inRangeP(this.positionBabies[0], 60)) {            
                existe = true;
                if (this.positionNextBaby.inRangeP(this.positionBabies[0], 60)) { 
                    super.feed(this.positionBabies[0]);
                } else {
                    this.eventGameOver('Esta no es la cria con más hambre');
                }
            }

            if (this.position.inRangeP(this.positionBabies[1], 60)) {
                existe = true;
                if (this.positionNextBaby.inRangeP(this.positionBabies[1], 60)) { 
                    super.feed(this.positionBabies[1]);
                } else {
                    this.eventGameOver('Esta no es la cria con más hambre');
                }
            }
            
            if (this.position.inRangeP(this.positionBabies[2], 60)) {
                existe = true;
                if (this.positionNextBaby.inRangeP(this.positionBabies[2], 60)) { 
                    super.feed(this.positionBabies[2]);
                } else {
                    this.eventGameOver('Esta no es la cria con más hambre');
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
