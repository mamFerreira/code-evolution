'use strict'

var GLOBAL = require ('../services/global');
var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var LevelActionShema = new Schema({    
    levelID: {type: Schema.ObjectId, ref: 'Level'},
    actionID: {type: Schema.ObjectId, ref: 'Action'}    
}, { versionKey: false});

module.exports = mongoose.model('Level_Action',LevelActionShema,GLOBAL.TABLE_LEVEL_ACTION);