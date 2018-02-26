import { Evolution } from './evolution.model';

export class Level {
    constructor(
        public _id: string,
        public order: number,
        public title: string,
        public description: string,
        public evolution: Evolution,
        public image: string
    ) {}
}
