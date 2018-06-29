export class User {
    constructor(
        public _id: string,
        public name: string,
        public surname: string,
        public email: string,
        public password: string,
        public admin: boolean,
        public counterLogin: number,
        public lastLogin: Date,        
        public gethash: string
    ) {}    
}
