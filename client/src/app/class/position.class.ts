export class Position {

    static range = 10;

    public x: number;
    public y: number;
    public active: boolean;    

    constructor(x, y, active = true) {
        this.x = x;
        this.y = y;        
        this.active = active;
    }

    inRange (x: number, y: number, coord: string = 'xy', range: number = null): boolean {         
        let result = true;

        range = range === null ? Position.range : range;

        switch (coord) {
            case 'x':            
                if ( x >= this.x + range || x <= this.x - range) {
                    result = false;
                }
                break;
            case 'y':            
                if ( y >= this.y + range || y <= this.y - range) {
                    result = false;
                }
                break;                
            case 'xy':
                if ( x >= this.x + range || x <= this.x - range || y >= this.y + range || y <= this.y - range) {
                    result = false;
                }
                break;
            default:
                result = false;
        }
        return result;        
    }

    inRangeP (p: Position, range: number = null): boolean {         
        let result = true;
        range = range === null ? Position.range : range;

        if ( p.x >= this.x + range || p.x <= this.x - range || p.y >= this.y + range || p.y <= this.y - range) {
            result = false;
        }

        return result;        
    }

    assign(p: Position) {
        this.x = p.x;
        this.y = p.y;
        this.active = p.active;
    }
}
