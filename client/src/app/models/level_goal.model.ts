import { Goal } from './goal.model';

export class LevelGoal {
    constructor(
        public _id: string,
        public level: string,
        public goal: Goal,
        public value1: number,
        public value2: number
    ) {}
}
