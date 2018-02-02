'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var LevelSchema = new Schema({
    order: Number,
    title: String,
    description: String,
    evolution: {type: Schema.ObjectId, ref: 'Evolution'},
    active: {type: Number, default: 1}
});

module.exports = mongoose.model('Level',LevelSchema,'level');