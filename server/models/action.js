'use strict'

var GLOBAL = require ('../services/global');
var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var ActionSchema = new Schema({
    order: Number,
    name: String,
    shortName: String,
    description: String,
    example: String
}, { versionKey: false});

module.exports = mongoose.model('Action', ActionSchema, GLOBAL.TABLE_ACTION);