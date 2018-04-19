'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var EvolutionSchema = new Schema({
    order: Number,
    name: String,
    description: String,
    origin: String,
    image: String,
    player: String,
    health: Number,
    tiledset: String,
    playerW: Number,
    playerH: Number,
    numLevels: {type: Number, default: 0},
});

module.exports = mongoose.model('Evolution',EvolutionSchema);