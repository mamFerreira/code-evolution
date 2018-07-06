'use strict'

var GLOBAL = require ('../services/global');
var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var LevelSchema = new Schema({
    order: Number,
    name: String,
    description: String,    
    time: {type: Number, default:0},
    image: String,
    file: String,
    evolutionID: {type: Schema.ObjectId, ref: 'EVOLUTION'},            
}, { versionKey: false});

module.exports = mongoose.model('Level',LevelSchema, GLOBAL.TABLE_LEVEL);