importScripts('./acorn_interpreter.js');
importScripts('./rapydscript.js');

var myInterpreter;
var compiler;
var dictionary = [];
var timeWait = 50;
var json;
var idInterval1;
var idIntevalResponse;

function waitResponse(callback){

    idIntevalResponse = setInterval(()=>{        
        if (json){
            callback(json)
            clearInterval(idIntevalResponse);                
        }
    },timeWait) 

}

function waitResponseObject(i, callback){

    idIntevalResponse = setInterval(()=>{        
        if (json){            
            var obj = i.createObject(i.OBJECT);
            i.setProperty(obj, 'x', i.createPrimitive(json.x));
            i.setProperty(obj, 'y', i.createPrimitive(json.y));
            callback(obj)
            clearInterval(idIntevalResponse);                
        }
    },timeWait) 

}

function addFunction (method){
    var wrapper = null;

    switch(method){
        case 'moveUp':
        case 'moveDown': 
        case 'moveRight': 
        case 'moveLeft':
            wrapper = (callback) => {                
                json = null;
                reply(method);          
                waitResponse(callback);
            };
            break;
        case 'imprimirValor':
            wrapper = (v) => {
                reply('printValue',v);
            }
            break;   
    }
         
    if (wrapper != null){        
        dictionary.push({
            key:   method,
            value: wrapper
        })
    }      
}

function initApi (i,s){        
    for (var index=0; index<dictionary.length; index++){
        i.setProperty(s, dictionary[index].key, i.createNativeFunction(dictionary[index].value));
    }
}

function reply () {
    if (arguments.length < 1) { 
        throw new TypeError("reply - not enough arguments"); 
        return; 
    }
    postMessage({ "action": arguments[0], "value": Array.prototype.slice.call(arguments, 1) });
}

function nextStep() {                
    idInterval = setInterval(
        () => { 
            try{
                if (!myInterpreter.step()){                    
                    stopEjecución();
                }
            }catch(e){                
                reply('error',e.message);
            }                         
        }, timeWait);
    myInterpreter.step();
}

function stopEjecución(){
    console.log('Fin de la ejecución ');
    clearInterval(idInterval);
}

var queryableFunctions = {

    initValue: (data) => {                  
        data.forEach(element => {
            addFunction(element.method);
        });                       
        compiler = RapydScript.create_embedded_compiler();
    },    

    execute: (data) => {           
        
        try{
            var code_translate = compiler.compile(data);
        }catch(e){
            console.log('Error al traducir: ' + e);
        }        
        myInterpreter = new Interpreter(code_translate, initApi);

        try{
            nextStep();
        }catch(e){
            console.log('Error al ejecutar: ' + e);
        }        
    },

    loadValue: (data) => {                   
        json = data;         
    }

};

self.addEventListener('message', (e) => {
    if (e.data instanceof Object && e.data.hasOwnProperty("action") && e.data.hasOwnProperty("value")) {         
        if (queryableFunctions.hasOwnProperty(e.data.action)){
            queryableFunctions[e.data.action].apply(self, e.data.value);
        }else{
            console.log('Función no declarada');
        }             
        //Añadir acción para contemplar el caso de que la acción no este definida en queryableFunctions
    } else {
        reply("error", e.data);
    }
});;
