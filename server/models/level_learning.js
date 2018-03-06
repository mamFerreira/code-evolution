'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var LevelLearningShema = new Schema({    
    level: {type: Schema.ObjectId, ref: 'Level'},
    learning: {type: Schema.ObjectId, ref: 'Learning'}
});

module.exports = mongoose.model('Level_Learning',LevelLearningShema,'level_learning');