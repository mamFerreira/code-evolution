import { StateMain } from '../state';

export class State extends StateMain {
    
    private _addedFood: boolean;    

    reload() {
        super.reload();
        this.groupFood.removeAll();
        this.addFood();
        this._addedFood = false;
    }

    preload() {
        super.preload();
        this.loadResource('food_amphibian', 'food/food_amphibian.png');
        this.loadResource('food_amphibian_poison', 'food/food_amphibian_poison.png');
    }
    
    create() {
        super.create();    
        this.groupFood = this.loadGroup();             
        this.addFood();
        super.reload();
    }

    update() { 
        
        if (!this._addedFood && this.numLevel >= 6) {
            this._addedFood = true;
            this.addFoodRandom();
        }

        super.update();
    }

    addFood() {
        if (this.numLevel < 6) {
            this.groupPosition.forEach( (p) => {
                this.groupFood.create(p.x - (this.sizeSprite / 2), p.y - (this.sizeSprite / 2), 'food_amphibian');
            });
        }      
    }

    addFoodRandom() {

            if (this.numLevel === 6) {
                let numFood = this.random(2, 8);                        
                for (let i = 0; i < numFood; i++) {
                    let x = this.random(60, 445);
                    let y = this.random(140, 270);
                    this.groupFood.create(x - (this.sizeSprite / 2), y - (this.sizeSprite / 2), 'food_amphibian');
                }
            } else if (this.numLevel === 7) {
                let numFood_1 = this.random(2, 5);            
                let numFood_2 = this.random(2, 5);                        
                // Bloque de tierra 1
                for (let i = 0; i < numFood_1; i++) {
                    let x = this.random(30, 150);
                    let y = this.random(150, 350);
                    this.groupFood.create(x - (this.sizeSprite / 2), y - (this.sizeSprite / 2), 'food_amphibian');
                }
                // Bloque de tierra 2
                for (let i = 0; i < numFood_2; i++) {
                    let x = this.random(355, 475);
                    let y = this.random(150, 350);
                    this.groupFood.create(x - (this.sizeSprite / 2), y - (this.sizeSprite / 2), 'food_amphibian');
                }
            } else if (this.numLevel === 8) {            
                for (let i = 0; i < this.foodGoal; i++) {
                    let x = this.random(30, 475);
                    let y = this.random(150, 350);
                    this.groupFood.create(x - (this.sizeSprite / 2), y - (this.sizeSprite / 2), 'food_amphibian');
                }
            }             
    }
}
