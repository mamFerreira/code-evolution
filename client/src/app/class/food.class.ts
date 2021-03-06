import { Position } from './position.class';

export class Food {
    public id: number;
    public type: string;
    public poisonous: boolean;
    public position: Position;

    constructor(id, type, x, y) {
        this.id = id;
        this.type = type;        
        this.position = new Position(x, y);
    }
}
