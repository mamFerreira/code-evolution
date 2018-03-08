'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GLOBAL = require ('../services/global');

var UserSchema = new Schema({
    name: String,
    surname: String,
    email: String,
    password: String,
    role: {type: String, default: 'ROLE_USER'},    
    image: String,
    level: {type: Schema.ObjectId, ref: 'Level', default: GLOBAL.ID_FIRST_LEVEL},
    active: {type: Number, default: 1}
});

module.exports = mongoose.model('User',UserSchema);