export class Position {
    private _x: number;
    private _y: number;
    private _active: boolean;    

    constructor(x, y, active = true) {
        this._x = x;
        this._y = y;        
        this._active = active;
    }

    get x(): number {
        return this._x;
    }
    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }
    set y(value: number) {
        this._y = value;
    }

    get active(): boolean {
        return this._active;
    }
    set active(value: boolean) {
        this._active = value;
    }

    inRange (x: number, y: number, range: number, coord: string = 'xy'): boolean {

        let result = true;

        switch (coord) {
            case 'x':            
                if ( x >= this._x + range || x <= this._x - range) {
                    result = false;
                }
                break;
            case 'y':            
                if ( y >= this._y + range || y <= this._y - range) {
                    result = false;
                }
                break;                
            case 'xy':
                if ( x >= this._x + range || x <= this._x - range || y >= this._y + range || y <= this._y - range) {
                    result = false;
                }
                break;
            default:
                result = false;
        }
        return result;        
    }

    assign(p: Position) {
        this._x = p.x;
        this._y = p.y;
        this._active = p.active;
    }
}
