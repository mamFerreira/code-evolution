import { GoalEnum } from '../enum/goal.enum';

export class GoalCheck {
    public key: GoalEnum;
    public value_1: string;
    public value_2: number;
    public overcome: number;
    public active: boolean;
    public current: number;

    constructor(key, v1 = '', v2 = 0) {
        this.key = key;
        this.value_1 = v1;
        this.value_2 = v2; 
        this.overcome = -1;
        this.active = false;       
        this.current = 0;
    }
}
