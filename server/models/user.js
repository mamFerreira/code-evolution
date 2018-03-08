'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: String,
    surname: String,
    email: String,
    password: String,
    role: {type: String, default: 'ROLE_USER'},    
    image: String,
    level: {type: Schema.ObjectId, ref: 'Level', default: '5a7c987d3e62ed6ebe9431d5'},
    active: {type: Number, default: 1}
});

module.exports = mongoose.model('User',UserSchema);