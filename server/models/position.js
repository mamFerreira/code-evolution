'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var PositionSchema = new Schema({
    level: {type: Schema.ObjectId, ref: 'Level'},
    value_x: Number,
    value_y: Number,
    initial: Boolean
});

module.exports = mongoose.model('Position',PositionSchema);