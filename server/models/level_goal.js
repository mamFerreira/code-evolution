'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var LevelGoalShema = new Schema({    
    level: {type: Schema.ObjectId, ref: 'Level'},
    goal: {type: Schema.ObjectId, ref: 'Goal'},
    value1: Number,
    value2: Number
});

module.exports = mongoose.model('Level_Goal',LevelGoalShema,'level_goal');