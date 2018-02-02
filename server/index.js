'use strict'

//Cargar módulo para trabajar con mongoDB
var mongoose = require('mongoose');
//Cargar app
var app = require('./app');
var global_var = require('./services/global');

var port = process.env.PORT || global_var.PORT;

mongoose.Promise = global.Promise;

mongoose.connect('mongodb://localhost:' + global_var.PORT_BBDD + '/code_evolution', (err, res) =>{
    if(err){
        console.log("Error");
        throw err;
        
    }else{
        console.log("Conexión a la BBDD realizada correctamente...");
        app.listen(port, function (){
            console.log("Servidor escuchando en http://localhost:/" + port);
        });
    }
    
});