'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var GLOBAL = require ('../services/global');

//Recibe todos los parametros de una petición HTTP
exports.ensureAuth = (req, res, next) => {
        
    if (!req.headers.authorization){
        return res.status(403).send({message:'Petición sin cabecera de autentificación'});
    }

    //Recogemos autorización
    var _token = req.headers.authorization.replace(/['"]+/g,'');
    
    try{
        var _payload = jwt.decode(_token,GLOBAL.TOKEN_KEY);

        if (_payload.exp <= moment().unix()){
            return res.status(401).send({message:"Token expirado"});
        }

    }catch(ex){        
        return res.status(404).send({message:'Token no válido'});
    }

    req.user = _payload;

  

    next();

};

exports.ensureAuthAdmin = (req, res, next) => {
        
    if (!req.headers.authorization){
        return res.status(403).send({message:'Petición sin cabecera de autentificación'});
    }

    //Recogemos autorización
    var _token = req.headers.authorization.replace(/['"]+/g,'');
    
    try{        
        var _payload = jwt.decode(_token,GLOBAL.TOKEN_KEY);        
        if (_payload.exp <= moment().unix()){
            return res.status(401).send({message:"Token expirado"});
        }

        if (!_payload.admin){
            return res.status(401).send({message:"Usuario sin permisos de administrador"});
        }

    }catch(ex){        
        return res.status(404).send({message:'Token no válido'});
    }    
    req.user = _payload;

    next();

};