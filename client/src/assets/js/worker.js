importScripts('./acorn_interpreter.js');
importScripts('./rapydscript.js');

const tiempoEspera = 10;

var interprete, compilador, intervalMain, intervalResponse;

var json, bloqueado;

var funciones = [];

var funcionesObjeto = [];

var funcionesWorker = {

    // Cargar métodos ejecutables por el worker e inicializar el compilador
    init : (data) => {
        data.forEach(element => {
            addMethod(element.method);
        });                       
        compilador = RapydScript.create_embedded_compiler();
    },   

    // Traducir código, definir interprete y empezar a ejecutar
    execute: (data) => {
        bloqueado = false;
        json = null;
        try{            
            var code_translate = compilador.compile(formatCode(data));
            interprete = new Interpreter(code_translate, initApi);
            nextStep();
        }catch(e){              
            sendError('Line:' + e.lineNumber + ' Colum: ' + e.col + '  ' + e.message)                                  
        }                                  
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
    unblock: () => {
        bloqueado = false;
    },

    // Finalizar la ejecución
    finish: () => {
        stop();
    }
};

// Añadimos evento de escucha al worker
self.addEventListener('message', (e) => {
    if (e.data instanceof Object && e.data.hasOwnProperty("action") && e.data.hasOwnProperty("value")) {             
        if (funcionesWorker.hasOwnProperty(e.data.action)){
            funcionesWorker[e.data.action].apply(self, e.data.value);
        }else{            
            sendError('Función ' + e.data.action +  ' no declarada');
        }                     
    } else {        
        sendError(e.data.value);
    }
});

// Añadir método ejecutable por el worker en el diccionario
function addMethod (method){
    var wrapperPlayer = null;  
    var wrapperObject = false; 

    switch(method){

        // Métodos sin argumentos y sin valor de retorno
        case 'moverArriba':
        case 'moverAbajo':
        case 'moverIzquierda':
        case 'moverDerecha':
        case 'comer':
        case 'coger':
        case 'tirar':         
        case 'alimentar':
            wrapperPlayer = (callback) => {                
                bloqueado = true;
                send(method);          
                waitUnblock(callback);
            };
            break;
        
        // Métodos con un argumento sin valor de retorno
        case 'hablar':
            wrapperPlayer = (v1,callback) => {                
                bloqueado = true;
                send(method,v1);          
                waitUnblock(callback);
            };
            break;

        // Métodos con dos argumentos sin valor de retorno
        case 'mover':
            wrapperPlayer = (v1, v2, callback) => {                
                bloqueado = true;
                send(method,v1, v2);          
                waitUnblock(callback);
            };
            break;                

        // Métodos sin argumentos con valor de retorno
        case 'x':
        case 'y':
        case 'preguntar':
        case 'ver':
        case 'escuchar':
                wrapperPlayer = (callback) => {
                    json = null;
                    send(method);
                    waitResponse(callback);
                };        
                break;
        
        // Métodos sin argumentos con objeto de retorno
        case 'buscarComida':
        case 'buscarObjeto':
        case 'almacenar':              
            wrapperObject = true;            
            break;                                                                                    
    }  

    if (wrapperPlayer != null){             
        funciones.push({
            key: method,
            value: wrapperPlayer
        });
    }             

    if (wrapperObject) {
        
        funcionesObjeto.push({
            key: method            
        });        
    }
}

// Formatear código
function formatCode(c) {
    var c_aux = 'player = generatePlayer()\n' + c;    
    c_aux = c_aux.replace(/' '+\n$/,'\n');   // Eliminamos salto de linea
    c_aux = c_aux.replace(/\t/g,'    ');     // Remplazamos tabulador por 4 espacios
    c_aux = c_aux.replace(/player.x/g,'player.x()');     // Añadimos funcionalidad
    c_aux = c_aux.replace(/player.y/g,'player.y()');     // Añadimos funcionalidad
    return c_aux;
}

// Envío de mensajes al hilo principal
function send () {
    if (arguments.length < 1) { 
        throw new TypeError("reply - not enough arguments");         
    }       
    postMessage({ "action": arguments[0], "value": Array.prototype.slice.call(arguments, 1) });
}

// Envío de mensajes de error al hilo principal
function sendError (msg) {
    postMessage({ "action": "error", "value": msg });
}

// Ejecución paso a paso del código enviado por el hilo principal
function nextStep() {
    intervalMain = setInterval(
        () => { 
            try{                
                if (!interprete.step()){                    
                    stop();
                    send('finish');
                }
            }catch(e){                 
                sendError(e.message)
            }                         
        }, tiempoEspera);
    interprete.step();
}

// Fin de la ejecución del código enviado por el hilo principal
function stop(){    
    clearInterval(intervalMain);        
    clearInterval(intervalResponse);     
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
            send('printArray',v.a);
        } else {
            send('print',v);      
        }
    }));
}

// Función de inicialización de la API del player
function initApiPlayer(i, callback){
    
    var obj = i.createObject(i.OBJECT);    
    
    for (var index=0; index<funciones.length; index++){        
        i.setProperty(obj, funciones[index].key, i.createAsyncFunction(funciones[index].value));        
    }  
    
    for (var index=0; index<funcionesObjeto.length; index++){
        var element = funcionesObjeto[index].key;
        var wrapper = (callback) => {                                      
            json = null;                 
            send(element);          
            waitResponseObject(i, callback);
        };        
        i.setProperty(obj, element, i.createAsyncFunction(wrapper));
    }
    callback(obj);
}

// Esperar desbloquo del hilo principal
function waitUnblock(callback){
    intervalResponse = setInterval(()=>{        
        if (!bloqueado){                         
            callback(bloqueado)
            clearInterval(intervalResponse);                
        }
    },tiempoEspera) 

}

// Esperar respuesta del hilo principal
function waitResponse(callback){
    intervalResponse = setInterval(()=>{        
        if (json != null){                               
            callback(json)
            clearInterval(intervalResponse);                
        }
    },tiempoEspera)
}

// Esperar respuesta del hilo principal con objeto alimento
function waitResponseObject(i, callback){
    
    intervalResponse = setInterval(()=>{          
        if (json != null){             
            if (json){                                                                                    
                var obj = i.createObject(i.OBJECT);
                i.setProperty(obj, 'id', i.createPrimitive(json.id));
                i.setProperty(obj, 'trampa', i.createPrimitive(json.trap));                
                i.setProperty(obj, 'x', i.createPrimitive(json.position.x));
                i.setProperty(obj, 'y', i.createPrimitive(json.position.y));                                                      
                callback(obj);                
            }else{
                callback(null);
            }            
            clearInterval(intervalResponse);                
        }
    },tiempoEspera) 

}