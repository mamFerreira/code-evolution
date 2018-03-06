'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var GoalSchema = new Schema({
    title: String
});

module.exports = mongoose.model('Goal',GoalSchema);