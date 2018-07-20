import { MainState } from './main.state';
import { GLOBAL } from '../../enum/global.enum';

import { Configure } from '../configure.class';
import { Position } from '../position.class';
import { Region } from '../region.class';
import { Size } from '../size.class';
import { LevelGoal } from '../../models/level_goal.model';

export class State extends MainState {     

    private regions: Array<Region>;        
    private initiated: boolean;


    constructor(health: number, time: number, goals: Array<LevelGoal>) {

        let c = new Configure(goals);  

        c.markedPosition = true;
        c.timeMax = time;
        c.healthMax = health;        
        c.fileMap = 'map3_2.json';
        c.filePlayer = 'player_3.png';
        c.fileTiledSet = 'tiledset_3.png';
        c.positionInit = new Position (225, 190);
        c.sizePlayer = new Size (45, 34);        
        c.addPosition(225, 190);                 
        
        super(c); 
        
        // Definimos las variables del nivel
        this.initiated = false;           
        this.regions = new Array<Region>();
        this.regions.push(new Region(new Position(25, 25), new Position(140, 160)));
        this.regions.push(new Region(new Position(160, 25), new Position(275, 160)));
        this.regions.push(new Region(new Position(295, 25), new Position(410, 160)));
        this.regions.push(new Region(new Position(25, 197), new Position(140, 350)));
        this.regions.push(new Region(new Position(160, 197), new Position(275, 350)));
        this.regions.push(new Region(new Position(295, 197), new Position(410, 350)));                     
    }

    reload() {
        this.initiated = false;
        super.reload();
    }

    preload() {
        super.preload();
        this.game.load.image('object_coin', GLOBAL.PATH_RESOURCE + 'object/coin.png');                
        this.game.load.image('object_bomb', GLOBAL.PATH_RESOURCE + 'object/bomb.png');    
    }

    create() {     
        super.create();                          
    }

    update() {    
        
        if (!this.initiated) {
            for (let i = 0; i < this.regions.length; i++) {                                                
                // Obtenemos la posicion donde se va a pintar
                let posX = this.random(this.regions[i].position1.x, this.regions[i].position2.x);
                let posY = this.random(this.regions[i].position1.y, this.regions[i].position2.y);
                // Obtenemos si pintamos bomba o no
                let isBombs = i === 1 || i === 3 ? true : false;                 

                if (isBombs) {
                    this.addObjectGroup(new Position(posX, posY), 'object_bomb');                    
                } else {
                    this.addObjectGroup(new Position(posX, posY), 'object_coin');                    
                }
                    
            }
            this.initiated = true;
        }

        super.update();
    }
}
