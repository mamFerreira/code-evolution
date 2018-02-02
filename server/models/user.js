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
    level: {type: Schema.ObjectId, ref: 'Level', default: '5a7431738fc4071e7a94f4d4'}
});

module.exports = mongoose.model('User',UserSchema,'user');