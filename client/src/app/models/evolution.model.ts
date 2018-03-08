export class Evolution {
    constructor(
        public _id: string,
        public order: number,
        public name: string,        
        public description: string,
        public origin: string,
        public image: string,
        public player: string,
        public health: number,
        public tiledset_surface: string,
        public tiledset_block: string
    ) {}
}
