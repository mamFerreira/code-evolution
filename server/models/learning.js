'use strict'

var GLOBAL = require ('../services/global');
var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var LearningSchema = new Schema({
    order: String,
    name: String,
    shortName: String,
    description: String,
    example: String
}, { versionKey: false});

module.exports = mongoose.model('Learning',LearningSchema, GLOBAL.TABLE_LEARNING);
