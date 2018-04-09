'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var LevelSchema = new Schema({
    order: Number,
    title: String,
    description: String,
    evolution: {type: Schema.ObjectId, ref: 'Evolution'},
    state: String,
    active: {type: Number, default: 1},
    image: String,
    time: {type: Number, default:0},
    code_default: String,
    map: String
});

module.exports = mongoose.model('Level',LevelSchema);