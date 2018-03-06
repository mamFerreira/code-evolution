'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var GameShema = new Schema({
    user: {type: Schema.ObjectId, ref: 'User'},
    level: {type: Schema.ObjectId, ref: 'Level'},
    code: {type: String, default: ''}
});

module.exports = mongoose.model('Game',GameShema);