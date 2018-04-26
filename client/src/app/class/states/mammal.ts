import { StateMain } from '../state-main';

export class State extends StateMain {
    
    private _addedFood: boolean; 
    private _food: Array<string>;    


    reload() {
        super.reload();   
        this.groupFood.removeAll();     
        this._addedFood = false;
    }

    preload() {
        super.preload();
        this.loadResource('acorn', 'food/food_acorn.png');        
        this.loadResource('chestnut', 'food/food_chestnut.png');
        this.loadResource('mushroom', 'food/food_mushroom.png');        
        this.loadResource('seed', 'food/food_seed.png');
    }
    
    create() {
        this._food = ['acorn', 'chestnut', 'mushroom', 'seed'];        
        super.create();    
        this.groupFood = this.loadGroup();                            
        super.reload();
    }

    update() {
        super.update();
        
        if (!this._addedFood) {
            this._addedFood = true;
            this.addFoodRandom();
        }
    }

    addFoodRandom() {  
        let x, y;      
        let min_x = 125;
        let max_x = 375;
        let min_y = 100;
        let max_y = 350;
        for (let i = 0; i < this.foodGoal * 2; i++) {
            /*let check = true;
            let d;
            do {
                x = this.random(min_x, max_x);
                y = this.random(min_y, max_y);                
                this.groupFood.forEach(element => {
                    if (this.distance(element.world.x, element.world.y, x, y) < this.sizeSprite / 1.8) {
                        check = false;                        
                    }
                });
            } while (!check);*/
            x = this.random(min_x, max_x);
            y = this.random(min_y, max_y);                
            this.groupFood.create(x - (this.sizeSprite / 2), y - (this.sizeSprite / 2), this._food[i % 4]);
        }
    }
}
