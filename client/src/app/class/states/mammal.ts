import { StateMain } from '../state-main';
import { Food } from '../food';

export class State extends StateMain {
    
    private _addedFood: boolean; 
    private _food: Array <[string, boolean]>;

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
        this._food = [['acorn', false], ['chestnut', false], ['mushroom', true], ['seed', true]];        
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
        let x, y, tmp;      
        let min_x = 50;
        let max_x = 450;
        let min_y = 120;
        let max_y = 350;
        for (let i = 0; i < this.foodGoal * 2; i++) {
            x = this.random(min_x, max_x);
            y = this.random(min_y, max_y);   
            tmp = this.game.add.sprite(x, y, this._food[i % 4][0]);
            this.groupFood.add(tmp);            
        }
    }

    eat(f: Food) {

        for (let i = 0; i < this._food.length; i++) {
            if (this._food[i][0] === f.type) {
                super.eat(f, this._food[i][1]);                
                return;
            }         
        }        
    }
}
