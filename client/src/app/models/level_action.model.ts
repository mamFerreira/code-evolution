import { Action } from './action.model';

export class LevelAction {
    constructor(
        public _id: string,
        public levelID: string,
        public actionID: string
    ) {}
}
