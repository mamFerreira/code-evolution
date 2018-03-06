'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var LevelActionShema = new Schema({    
    level: {type: Schema.ObjectId, ref: 'Level'},
    action: {type: Schema.ObjectId, ref: 'Action'}
});

module.exports = mongoose.model('Level_Action',LevelActionShema,'level_action');