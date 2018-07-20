import { Position } from './position.class';

export class Region {
    public position1: Position;
    public position2: Position;

    constructor(p1: Position, p2: Position) {
        this.position1 = p1;
        this.position2 = p2;        
    }
}
