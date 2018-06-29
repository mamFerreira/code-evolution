export class Action {
    constructor(
        public _id: string,
        public order: number,
        public name: string,
        public shortName: string,
        public description: string,
        public example: string
    ) {}
}
