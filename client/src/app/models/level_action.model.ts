import { Action } from './action.model';

export class LevelAction {
    constructor(
        public _id: string,
        public level: string,
        public action: Action
    ) {}
}
