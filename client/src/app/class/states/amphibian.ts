import { StateMain } from '../state-main';

export class State extends StateMain {
    
    reload() {
        super.reload();
        this.groupFood.removeAll();
    }

    preload() {
        super.preload();
        this.loadResource('food_amphibian', 'food/food_amphibian.png');
        this.loadResource('food_amphibian_poison', 'food/food_amphibian_poison.png');
    }
    
    create() {
        super.create();    
        this.groupFood = this.loadGroup(); 
        super.reload();
    }

    update() {
        super.update();
        

        if (this.groupFood.length === 0 && !this.wait) {

            let limit = this.sizeCanvas;
            let x = super.random(this.sizePlayer_x, limit[0] - this.sizePlayer_x);
            let y = super.random(this.sizePlayer_y, limit[1] - this.sizePlayer_y);

            this.groupFood.create(x, y, 'food_amphibian');
        }

        this.game.physics.arcade.collide(this.player, this.groupFood, this.eventCollisionFood, null, this);
    }
}
