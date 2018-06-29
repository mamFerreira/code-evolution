'use strict'

var GLOBAL = require ('../services/global');
var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var LevelGoalShema = new Schema({        
    value_1: Number,
    value_2: Number,
    levelID: {type: Schema.ObjectId, ref: 'Level'},
    goalID: {type: Schema.ObjectId, ref: 'Goal'}
}, { versionKey: false});

module.exports = mongoose.model('Level_Goal',LevelGoalShema,GLOBAL.TABLE_LEVEL_GOAL);