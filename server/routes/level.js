'use strict'

var express = require ('express');

var md_auth = require ('../middlewares/authenticated');
var LevelController = require ('../controllers/level');

var api = express.Router();

api.get('/level/:id', md_auth.ensureAuth, LevelController.getLevel);
api.get('/levels/:evolution?', md_auth.ensureAuth, LevelController.getLevels);
api.post('/level-add', md_auth.ensureAuthAdmin, LevelController.addLevel);
api.put('/level-update/:id',md_auth.ensureAuthAdmin,LevelController.updateLevel);
api.put('/level-desactive/:id',md_auth.ensureAuthAdmin,LevelController.desactiveLevel);

module.exports = api;