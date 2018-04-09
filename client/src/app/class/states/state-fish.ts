import { StateMain } from '../state-main';
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

        if (this.groupFood.length === 0 && this.posInitial.inRange(this.player.x, this.player.y, 2)) {
            let number = this.random(1, this.groupPosition.length - 1);
            this.groupFood.create(this.groupPosition[number].x, this.groupPosition[number].y, 'food_fish');
        }        
        this.game.physics.arcade.collide(this.player, this.groupFood, this.eventCollisionFood, null, this);
    }
}
