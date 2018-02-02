'use strict'

var express = require('express');
var bodyParser = require('body-parser');

var app = express();

//Cargar ficheros de rutas: var entity_routes = require('./routes/entity');
var user_routes = require('./routes/user');
var evolution_routes = require('./routes/evolution');
var level_routes = require('./routes/level');

//Convertir a objetos JSON los datos que nos llegan por las peticiones HTTP
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

//Configurar cabeceras http
app.use((req, res, next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,DELETE');
    res.header('Allow','GET,POST,OPTIONS,PUT,DELETE');
    next();
});

//Cargar rutas base de ficheros: app.use('/api',entity_routes);
app.use('/api',user_routes);
app.use('/api',evolution_routes);
app.use('/api',level_routes);

//Exportamos el módulo
module.exports = app;