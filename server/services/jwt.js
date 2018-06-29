'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var GLOBAL = require ('../services/global');

//iat: Fecha de creación del token
//exp: Fecha de expiración del token
exports.createToken = (user) => {
    var _payload = {
        sub: user._id,        
        admin: user.admin,        
        iat: moment().unix(),        
        exp: moment().add(5,'hours').unix()
    }    

    return jwt.encode(_payload,GLOBAL.TOKEN_KEY);

};