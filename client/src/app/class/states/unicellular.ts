import { StateMain } from '../state-main';

export class State extends StateMain {
    
    reload() {
        super.reload();
        // Código específico
    }

    preload() {
        super.preload();
        // Código específico
    }
    
    create() {
        super.create();    
        // Código específico
        super.reload();
    }

    update() {
        super.update();
        // Código específico
    }

    position() {
        return super.positionPlayer(true);        
    }
}
