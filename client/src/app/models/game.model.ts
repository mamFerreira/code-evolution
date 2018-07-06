export class Game {
    constructor(
        public _id: string,
        public code: string,
        public overcome: boolean,
        public userID: string,
        public levelID: string        
    ) {}
}
