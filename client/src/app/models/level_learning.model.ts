import { Learning } from './learning.model';

export class LevelLearning {
    constructor(
        public _id: string,
        public level: string,
        public learning: Learning,
    ) {}
}
