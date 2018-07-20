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

    inRange (x: number, y: number, coord: string = 'xy'): boolean {         
        let result = true;

        switch (coord) {
            case 'x':            
                if ( x >= this.x + Position.range || x <= this.x - Position.range) {
                    result = false;
                }
                break;
            case 'y':            
                if ( y >= this.y + Position.range || y <= this.y - Position.range) {
                    result = false;
                }
                break;                
            case 'xy':
                if ( x >= this.x + Position.range || x <= this.x - Position.range || y >= this.y + Position.range || y <= this.y - Position.range) {
                    result = false;
                }
                break;
            default:
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
