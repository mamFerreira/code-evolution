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

            let aux = new Array<Position> ();
            let number;
            
            
            this.groupPosition.forEach(p => {
                if (! p.inRange(this.player.x, this.player.y, 2)) {
                    // Arriba                    
                    if (p.inRange(this.player.x, 0, 2, 'x') && this.player.y - p.y < 150 && this.player.y > p.y) {
                        aux.push(p);                        
                    }
                    // Abajo
                    if (p.inRange(this.player.x, 0, 2, 'x') && p.y - this.player.y < 150 && this.player.y < p.y) {
                        aux.push(p);                        
                    }
                    // Derecha
                    if (p.inRange(0, this.player.y, 2, 'y') && p.x - this.player.x < 150 && this.player.x < p.x) {
                        aux.push(p);                        
                    }
                    // Izquierda
                    if (p.inRange(0, this.player.y, 2, 'y') && this.player.x - p.x < 150 && this.player.x > p.x) {
                        aux.push(p);                        
                    }
                }
            });

            number = this.random(0, aux.length - 1);                                    
            this.groupFood.create(aux[number].x, aux[number].y, 'food_fish');
        }        
        this.game.physics.arcade.collide(this.player, this.groupFood, this.eventCollisionFood, null, this);
    }

    positionPlayer() {   
        let p = new Position(this.player.x, this.player.y);  

        this.groupPosition.forEach(pos => {               
            if (p.inRange(pos.x, pos.y, 5)) {
                p.x = pos.x + (this.sizeSprite / 2);
                p.y = pos.y + (this.sizeSprite / 2);
                return;                
            }
        });                
        return p;
    }
}
