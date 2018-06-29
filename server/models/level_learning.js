'use strict'

var GLOBAL = require ('../services/global');
var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var LevelLearningShema = new Schema({    
    levelID: {type: Schema.ObjectId, ref: 'Level'},
    learningID: {type: Schema.ObjectId, ref: 'Learning'}
}, { versionKey: false});

module.exports = mongoose.model('Level_Learning',LevelLearningShema,GLOBAL.TABLE_LEVEL_LEARNING);