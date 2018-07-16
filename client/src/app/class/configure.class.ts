import { Position } from './position.class';
import { Size } from './size.class';
import { GoalCheck } from '../class/goal_check.class';
import { LevelGoal } from '../models/level_goal.model';
import { GoalEnum } from '../enum/goal.enum';

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
    static sizeBar = new Size(200, 20);
    static sizeSprite = new Size(32, 32);
    static positionBar = new Position (25, 400);    
    static velocity = 150;
    static volumenDefault = true;    
    static nameState = 'gameplay';    
    
    public markedPosition: boolean;
    public fileMap: String;
    public filePlayer: String;
    public fileTiledSet: String;
    public timeMax: number;
    public healthMax: number;
    public positionInit: Position;
    public sizePlayer: Size;
    public positionsChecked: Array<Position>;
    public goals: Array<GoalCheck>;

    constructor(goals: Array<LevelGoal>) {
        this.positionsChecked = new Array<Position>();
        this.goals = new Array<GoalCheck>();    

        this.goals.push(new GoalCheck (GoalEnum.POSITION));
        this.goals.push(new GoalCheck (GoalEnum.FOOD));
        this.goals.push(new GoalCheck (GoalEnum.NO_OPERATOR));
        this.goals.push(new GoalCheck (GoalEnum.OPERATOR));
        this.goals.push(new GoalCheck (GoalEnum.LINES));
        this.goals.push(new GoalCheck (GoalEnum.OBJECT));
        this.goals.push(new GoalCheck (GoalEnum.BABY));

        goals.forEach(element => {
            let key = GoalEnum[element.goal.key];            
            this.goals[key].active = true;            
            this.goals[key].value_1 = element.value_1;
            this.goals[key].value_2 = element.value_2;
        });
    }

    addPosition(x: number, y: number) {
        this.positionsChecked.push(new Position(x, y));
    }    
}
