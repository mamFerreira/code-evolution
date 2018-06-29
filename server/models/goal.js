'use strict'

var GLOBAL = require ('../services/global');
var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var GoalSchema = new Schema({
    key: String,
    name: String
}, { versionKey: false});

module.exports = mongoose.model('Goal',GoalSchema, GLOBAL.TABLE_GOAL);