importScripts('./acorn_interpreter.js');
importScripts('./rapydscript.js');

var myInterpreter;
var compiler;
var AsyncFunctions = [];
var NativeFunctions = [];
var ObjectFunctions = [];
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
            var code_translate = compiler.compile(data);
        }catch(e){            
            reply('error','Line:'+e.lineNumber + ' Colum: ' + e.col + '  ' + e.message);
            return;
        }        

        myInterpreter = new Interpreter(code_translate, initApi);
        nextStep();
                  
    },

    // Cargar valor en JSON
    loadValue: (data) => {                   
        json = data;         
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
            reply('error','Función ' + e.data.action +  'no declarada');
        }                     
    } else {
        reply("error", e.data);
    }
});

// Añadir método ejecutable por el worker en el diccionario
function addMethod (method){
    var wrapperAsync = null;
    var wrapperNative = null;
    var wrapperObject = null;

    switch(method){
        case 'moveUp':
        case 'moveDown': 
        case 'moveRight': 
        case 'moveLeft':
            wrapperAsync = (callback) => {                
                block = true;
                reply(method);          
                waitResponse(callback);
            };
            break;
        case 'move':
            wrapperAsync = (v1, v2, callback) => {
                block = true;
                reply(method,v1, v2); 
                waitResponse(callback);               
            };
            break;
        case 'findNearestFood':
            wrapperObject = () => {};
            break;        
    }

    if (wrapperNative != null){        
        NativeFunctions.push({
            key:   method,
            value: wrapperNative
        })
    }  

    if (wrapperAsync != null){        
        AsyncFunctions.push({
            key:   method,
            value: wrapperAsync
        })
    } 

    if (wrapperObject != null){        
        ObjectFunctions.push({
            key:   method,
            value: wrapperObject
        })        
    }  
            
}

// Función de inicialización de la API del worker
function initApi (i,s){ 
    
    for (var index=0; index<NativeFunctions.length; index++){
        i.setProperty(s, NativeFunctions[index].key, i.createNativeFunction(NativeFunctions[index].value));
    }
    
    for (var index=0; index<AsyncFunctions.length; index++){
        i.setProperty(s, AsyncFunctions[index].key, i.createAsyncFunction(AsyncFunctions[index].value));
    }
    
    for (var index=0; index<ObjectFunctions.length; index++){

        var key = ObjectFunctions[index].key;

        var wrapper = (callback) => {                
            json = null;
            reply(key);          
            waitResponseObject(i, callback);
        };    

        i.setProperty(s, key, i.createAsyncFunction(wrapper));
    }
    
    i.setProperty(s, 'print', i.createNativeFunction((v) => {reply('print',v);}));

}

// Envío de mensaje al hilo principal
function reply () {
    if (arguments.length < 1) { 
        throw new TypeError("reply - not enough arguments"); 
        return; 
    }
    postMessage({ "action": arguments[0], "value": Array.prototype.slice.call(arguments, 1) });
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
                reply('error',e.message);
            }                         
        }, timeWait);
    myInterpreter.step();
}

// Fin de la ejecución del código enviado por el hilo principal
function stop(){    
    block = false;
    clearInterval(idInterval);        
}

// Esperar respuesta del hilo principal
function waitResponse(callback){

    idIntervalResponse = setInterval(()=>{        
        if (!block){
            callback(block)
            clearInterval(idIntervalResponse);                
        }
    },timeWait) 

}

// Esperar respuesta del hilo principal con objeto
function waitResponseObject(i, callback){

    idIntevalResponse = setInterval(()=>{        
        if (json){            
            var obj = i.createObject(i.OBJECT);
            i.setProperty(obj, 'x', i.createPrimitive(json._x));
            i.setProperty(obj, 'y', i.createPrimitive(json._y));            
            callback(obj)
            clearInterval(idIntevalResponse);                
        }
    },timeWait) 

}














