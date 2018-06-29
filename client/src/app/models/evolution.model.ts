export class Evolution {
    constructor(
        public _id: string,
        public order: number,
        public origin: string,        
        public name: string,
        public description: string,
        public health: number,
        public image: string
    ) {}
}
