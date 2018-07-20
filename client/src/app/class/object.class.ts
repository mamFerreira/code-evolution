import { Position } from './position.class';

export class Objecto {
    public id: number;
    public trap: boolean;    
    public position: Position;

    constructor(id, trap, x, y) {
        this.id = id;
        this.trap = trap;        
        this.position = new Position(x, y);
    }
}
