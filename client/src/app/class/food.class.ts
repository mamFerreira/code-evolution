import { Position } from './position.class';

export class Food {
    private _id: number;
    private _type: string;
    private _poisonous: boolean;
    private _position: Position;

    constructor(id, type, x, y) {
        this._id = id;
        this._type = type;        
        this._position = new Position(x, y);
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get type(): string {
        return this._type;
    }
    
    set type(value: string) {
        this._type = value;
    }    

    get x(): number {
        return this._position.x;
    }
    
    set x(value: number) {
        this._position.x = value;
    }

    get y(): number {
        return this._position.y;
    }
    
    set y(value: number) {
        this._position.y = value;
    }
}
