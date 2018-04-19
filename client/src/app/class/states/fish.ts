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

            if (this.numLevel < 7) {            

                if (this.posInitial.inRange(p_player.x, p_player.y, 5)) {
                    let number = this.random(1, this.groupPosition.length - 1);
                    this.groupFood.create(this.groupPosition[number].x - (this.sizeSprite / 2), this.groupPosition[number].y - (this.sizeSprite / 2), 'food_fish');
                }                   

            } else {
                let array_p = new Array<Position> ();
                let number;
                this.groupPosition.forEach(p => {
                    if (! p.inRange(p_player.x, p_player.y, 5)) {
                        // Arriba                    
                        if (p.inRange(p_player.x, 0, 5, 'x') && p_player.y - p.y < 150 && p_player.y > p.y) {
                            array_p.push(p);                        
                        }
                        // Abajo
                        if (p.inRange(p_player.x, 0, 5, 'x') && p.y - p_player.y < 150 && p_player.y < p.y) {
                            array_p.push(p);                        
                        }
                        // Derecha
                        if (p.inRange(0, p_player.y, 5, 'y') && p.x - p_player.x < 150 && p_player.x < p.x) {
                            array_p.push(p);                        
                        }
                        // Izquierda
                        if (p.inRange(0, p_player.y, 5, 'y') && p_player.x - p.x < 150 && p_player.x > p.x) {
                            array_p.push(p);                        
                        }
                    }
                });

                number = this.random(0, array_p.length - 1);                                    
                this.groupFood.create(array_p[number].x - (this.sizeSprite / 2), array_p[number].y - (this.sizeSprite / 2), 'food_fish');
            }
                        
        } 
        this.game.physics.arcade.collide(this.player, this.groupFood, this.eventCollisionFood, null, this);
    }

    position() {
        return super.positionPlayer(true);        
    }

}
