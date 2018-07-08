export class Checker {

    constructor () { }

    checkArray (array, value) {

        if (array.length !== value) {
            return false;
        }

        for (let i = 0; i < array.length; i++) {
            if (array[i] === undefined) {
                return false;
            }
        }

        return true;
    }

    checkIntPos (value) {
        if (value !== parseInt(value, 10)) {
            return false;
        }

        if (parseInt(value, 10) < 0) {
            return false;
        }

        return true;
    }
}
