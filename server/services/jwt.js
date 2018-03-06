'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var token_key = 'C0D3-3V0LUT10N';


//iat: Fecha de creación del token
//exp: Fecha de expiración del token
exports.createToken = (user) => {
    var _payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        level_id: user.level._id,
        level_order: user.level.order,
        evolution_id: user.level.evolution._id,
        evolution_order: user.level.evolution.order,
        iat: moment().unix(),
        exp: moment().add(5,'hours').unix()
    }    

    return jwt.encode(_payload,token_key);

};