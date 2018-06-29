'use strict'

var GLOBAL = require ('../services/global');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
    name: String,
    surname: String,
    email: String,
    password: String,
    admin: {type: Boolean, default: false},    
    counterLogin: Number,
    lastLogin: Date
}, { versionKey: false});

module.exports = mongoose.model('User', UserSchema, GLOBAL.TABLE_USER);