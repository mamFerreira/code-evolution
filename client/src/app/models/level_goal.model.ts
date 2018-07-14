import { Goal } from './goal.model';

export class LevelGoal {
    constructor(
        public _id: string,
        public value_1: string,
        public value_2: number,
        public levelID: string,
        public goalID: string,
        public goal: Goal,
        public overcome: number = -1               
    ) {}
}
