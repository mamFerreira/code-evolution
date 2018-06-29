'use strict'

var GLOBAL = require ('../services/global');
var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var GameShema = new Schema({
    code: {type: String, default: ''},
    overcome: {type: Boolean, default: false},
    userID: {type: Schema.ObjectId, ref: 'USER'},
    levelID: {type: Schema.ObjectId, ref: 'LEVEL'}    
}, { versionKey: false});

module.exports = mongoose.model('Game',GameShema, GLOBAL.TABLE_GAME);