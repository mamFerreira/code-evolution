'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var ActionSchema = new Schema({
    order: Number,
    method: String,
    key: String,
    description: String,
    example: String
});

module.exports = mongoose.model('Action',ActionSchema);