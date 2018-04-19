export class Action {
    constructor(
        public _id: string,
        public method: string,
        public key: string,
        public description: string,
        public example: string
    ) {}
}
