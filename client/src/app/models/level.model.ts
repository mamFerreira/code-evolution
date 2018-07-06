import { Evolution } from './evolution.model';
import { Action } from './action.model';
import { Learning } from './learning.model';
import { LevelGoal } from './level_goal.model';

export class Level {
    constructor(
        public _id: string,
        public order: number,
        public name: string,
        public description: string,                
        public time: number,        
        public image: string,
        public file: string,
        public evolution: Evolution,
        public actions: Array<Action>,
        public learnings: Array<Learning>,
        public goals: Array<LevelGoal>
    ) {}
}
