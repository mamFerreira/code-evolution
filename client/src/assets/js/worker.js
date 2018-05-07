importScripts('./acorn_interpreter.js');
importScripts('./rapydscript.js');

var myInterpreter;
var compiler;
var PlayerFunctions = [];
var PlayerObjectFunctions = [];
var timeWait = 10;
var json, block;
var idInterval;

// Operaciones disponibles en el worker
var queryableFunctions = {

    // Cargar métodos ejecutables por el worker e inicializar el compilador
    initValue: (data) => {                         
        data.forEach(element => {
            addMethod(element.method);
        });                       
        compiler = RapydScript.create_embedded_compiler();
    },   

    // Traducir código, definir interprete y empezar a ejecutar
    execute: (data) => {

        try{
            var code_format = formatCode(data)
            var code_translate = compiler.compile(code_format);
        }catch(e){  
            replyError('Line:' + e.lineNumber + ' Colum: ' + e.col + '  ' + e.message)                      
            return;
        }        

        myInterpreter = new Interpreter(code_translate, initApi);
        nextStep();
                  
    },

    // Cargar valor en JSON
    loadValue: (data) => {   
        if (data != null){
            json = data;     
        } else {
            json = false;
        }                          
    },

    // Desbloquear la ejecución de código
    unblock: (data) => {
        block = false;
    },

    // Finalizar la ejecución
    finish: (data) => {
        stop();
    }
};

// Añadimos evento de escucha al worker
self.addEventListener('message', (e) => {
    if (e.data instanceof Object && e.data.hasOwnProperty("action") && e.data.hasOwnProperty("value")) {         
        if (queryableFunctions.hasOwnProperty(e.data.action)){
            queryableFunctions[e.data.action].apply(self, e.data.value);
        }else{            
            replyError('Función ' + e.data.action +  'no declarada');
        }                     
    } else {        
        replyError(e.data);
    }
});

// Formatear código
function formatCode(c) {
    var c_aux = 'player = generatePlayer()\n' + c;    
    c_aux = c_aux.replace(/' '+\n$/,'\n');   // Eliminamos salto de linea
    c_aux = c_aux.replace(/\t/g,'    ');     // Remplazamos tabulador por 4 saltos de linea
    return c_aux;
}

// Añadir método ejecutable por el worker en el diccionario
function addMethod (method){
    var wrapperPlayer = null;  
    var wrapperObject = false; 

    switch(method){
        case 'moveUp':
        case 'moveDown': 
        case 'moveRight': 
        case 'moveLeft':
            wrapperPlayer = (callback) => {                
                block = true;
                reply('position',method);          
                waitUnblock(callback);
            };
            break;
        case 'move':
            wrapperPlayer = (v1, v2, callback) => {                
                block = true;
                reply('position',method,v1, v2);          
                waitUnblock(callback);
            };
            break;
        case 'food':
            wrapperPlayer = (callback) => {
                json = null;                                
                reply('food',method);
                waitResponse(callback);
            };
            break;
        case 'position':
            wrapperObject = true;
            break;
        case 'eat':
            wrapperPlayer = (v,callback) => {                
                block = true;                
                reply('food',method,v.a);          
                waitUnblock(callback);
            };
            break;
        case 'discardFood':
            wrapperPlayer = (v,callback) => {                
                block = true;                
                reply('food',method,v.a);          
                waitUnblock(callback);
            };
            break;
        case 'findNearestFood':
            wrapperObject = true;
            break;
        case 'existsFood':
            wrapperPlayer = (callback) => {
                json = null;
                reply('food',method);
                waitResponse(callback);
            };
            break;
    }  

    if (wrapperPlayer != null){             
        PlayerFunctions.push({
            key: method,
            value: wrapperPlayer
        });
    }             

    if (wrapperObject) {
        PlayerObjectFunctions.push({
            key: method            
        });
    }
}

// Envío de mensajes al hilo principal
function reply () {
    if (arguments.length < 1) { 
        throw new TypeError("reply - not enough arguments"); 
        return; 
    }    
    postMessage({ "type": arguments[0], "action": arguments[1], "value": Array.prototype.slice.call(arguments, 2) });
}

// Envío de mensajes de error al hilo principal
function replyError (msg) {
    postMessage({ "type": "error", "action": "", "value": msg });
}

// Ejecución paso a paso del código enviado por el hilo principal
function nextStep() {                
    idInterval = setInterval(
        () => { 
            try{                
                if (!myInterpreter.step()){                    
                    stop();
                    reply('finish');
                }
            }catch(e){                                
                replyError(e.message)
            }                         
        }, timeWait);
    myInterpreter.step();
}

// Fin de la ejecución del código enviado por el hilo principal
function stop(){    
    block = false;
    clearInterval(idInterval);        
}

// Función de inicialización de la API del worker
function initApi (i,s){ 

    // Funciones player
    i.setProperty(s, 'generatePlayer', i.createAsyncFunction(
        (callback) => {
            initApiPlayer(i, callback);
        }
    ));

    // Función print
    i.setProperty(s, 'print', i.createNativeFunction((v) => {
        if (v.G === 'Array'){
            reply('primary','printArray',v.a);
        } else {
            reply('primary','print',v);      
        }
    }));
}

// Función de inicialización de la API del player
function initApiPlayer(i, callback){
    
    var obj = i.createObject(i.OBJECT);    
    
    for (var index=0; index<PlayerFunctions.length; index++){        
        i.setProperty(obj, PlayerFunctions[index].key, i.createAsyncFunction(PlayerFunctions[index].value));        
    }  
    
    for (var index=0; index<PlayerObjectFunctions.length; index++){

        switch(PlayerObjectFunctions[index].key){
            case 'position':
                var wrapper = (callback) => {                                      
                    json = null;            
                    reply('position','position');          
                    waitResponsePosition(i, callback);
                };
                break;
            case 'findNearestFood':
                var wrapper = (callback) => {                                      
                    json = null;            
                    reply('food','findNearestFood');          
                    waitResponseFood(i, callback);
                };
                break;
        }

        i.setProperty(obj, PlayerObjectFunctions[index].key, i.createAsyncFunction(wrapper));

    }

    callback(obj);

}

// Esperar desbloquo del hilo principal
function waitUnblock(callback){
    idIntervalResponse = setInterval(()=>{        
        if (!block){                   
            callback(block)
            clearInterval(idIntervalResponse);                
        }
    },timeWait) 

}

// Esperar respuesta del hilo principal
function waitResponse(callback){
    idIntervalResponse = setInterval(()=>{        
        if (json != null){                               
            callback(json)
            clearInterval(idIntervalResponse);                
        }
    },timeWait)
}

// Esperar respuesta del hilo principal con posición
function waitResponsePosition(i, callback){
    
    idIntevalResponse = setInterval(()=>{                               
        if (json){                        
            if (json._active){                                
                var obj = i.createObject(i.OBJECT);
                i.setProperty(obj, 'x', i.createPrimitive(json._x));
                i.setProperty(obj, 'y', i.createPrimitive(json._y));            
                callback(obj);
            }else{
                callback(null);
            }            
            clearInterval(idIntevalResponse);                
        }
    },timeWait) 

}

// Esperar respuesta del hilo principal con objeto alimento
function waitResponseFood(i, callback){
    
    idIntevalResponse = setInterval(()=>{          
        if (json != null){                                        
            if (json){                                     
                var obj = i.createObject(i.OBJECT);
                i.setProperty(obj, 'id', i.createPrimitive(json._id));
                i.setProperty(obj, 'type', i.createPrimitive(json._type));                
                i.setProperty(obj, 'x', i.createPrimitive(json._position._x));
                i.setProperty(obj, 'y', i.createPrimitive(json._position._y));                        
                callback(obj);
            }else{
                callback(null);
            }            
            clearInterval(idIntevalResponse);                
        }
    },timeWait) 

}