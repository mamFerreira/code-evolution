import { Position } from './position.class';
import { Size } from './size.class';
import { LevelGoal } from '../models/level_goal.model';


export class Configure {

    static path = '../../..';

    static styleScore = {
        font: 'bold 16pt Arial',
        fill: '#000000',       
    };

    static stylePositionClick = {
        font: 'bold 8pt Arial', 
        fill: '#000000',
        align: 'center'
    };

    static sizeCanvas = new Size(448, 385);
    static sizeScore = new Size(448, 65);
    static sizeBar = new Size(200, 40);
    static sizeSprite = new Size(32, 32);

    static positionBar = new Position (25, 400);
    
    static velocity = 64;
    static volumenDefault = true;
    static nameState = 'gameplay';

    public fileMap: String;
    public filePlayer: String;
    public fileTiledSet: String;

    public timeMax: number;
    public healthMax: number;

    public positionPlayer: Position;
    public sizePlayer: Size;

    public positionsChecked: Array<Position>;

    public goals: Array<LevelGoal>;

    constructor() {
        this.positionsChecked = new Array<Position>();
    }

    addPosition(x: number, y: number) {
        this.positionsChecked.push(new Position(x, y));
    }
}