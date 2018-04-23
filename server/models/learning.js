'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var LearningSchema = new Schema({
    order: Number,
    title: String,
    key: String,
    description: String,
    example: String
});

module.exports = mongoose.model('Learning',LearningSchema);
