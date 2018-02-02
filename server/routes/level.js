'use strict'

var express = require ('express');

var md_auth = require ('../middlewares/authenticated');
var LevelController = require ('../controllers/level');

var api = express.Router();

api.post('/level-add', md_auth.ensureAuthAdmin, LevelController.addLevel);

module.exports = api;