'use strict'

var GLOBAL = require ('../services/global');
var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var EvolutionSchema = new Schema({
    order: Number,
    origin: String,
    name: String,
    description: String,
    health: Number,
    image: String        
}, { versionKey: false});

module.exports = mongoose.model('Evolution',EvolutionSchema, GLOBAL.TABLE_EVOLUTION);