import { StateMain } from '../state-main';
import { Position } from '../position';
import { Global } from '../../enum/global';

export class State extends StateMain {

    reload() {
        super.reload();
        this.groupFood.removeAll();
    }

    preload() {
        super.preload();        
        this.loadResource('food_fish', 'food/food_fish.png');        
    }

    create() {
        super.create();                
        this.groupFood = this.loadGroup();              
        this.reload();
    }

    update() {
        super.update();

        if (this.groupFood.length === 0 && !this.wait) {
            let p_player = super.positionPlayer(true);

            if (this.posInitial.inRange(p_player.x, p_player.y, 5)) {
                let number = this.random(1, this.groupPosition.length - 1);
                this.groupFood.create(this.groupPosition[number].x - (this.sizeSprite / 2), this.groupPosition[number].y - (this.sizeSprite / 2), 'food_fish');
            }                        
        }        
    }

    position() {
        return super.positionPlayer(true);        
    }

}
