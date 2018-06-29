'use strict'

var express = require ('express');
var md_auth = require ('../middlewares/authenticated');
var GameController = require ('../controllers/game');

var api = express.Router();

api.post('/game-register', md_auth.ensureAuth, GameController.registerGame);
api.get('/games-get/:userID?/:levelID?',md_auth.ensureAuth, GameController.getGames);
api.delete('/game-remove/:id', md_auth.ensureAuthAdmin ,GameController.removeGame);

module.exports = api;