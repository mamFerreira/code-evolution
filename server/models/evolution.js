'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var EvolutionSchema = new Schema({
    order: Number,
    name: String,
    description: String,
    image: String,
    image_small: String
});

module.exports = mongoose.model('Evolution',EvolutionSchema,'evolution');