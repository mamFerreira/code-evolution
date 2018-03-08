import { Evolution } from './evolution.model';

export class Level {
    constructor(
        public _id: string,
        public order: number,
        public title: string,
        public description: string,
        public evolution: string,
        public active: number,
        public image: string,
        public time: number,
        public code_default: string,
        public map: string
    ) {}
}
