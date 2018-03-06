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
    tiledset_surface: String,
    tiledset_block: String
});

module.exports = mongoose.model('Evolution',EvolutionSchema);