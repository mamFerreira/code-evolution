'use strict'

var express = require ('express');

var md_auth = require ('../middlewares/authenticated');
var EvolutionController = require ('../controllers/evolution');

var api = express.Router();

api.get('/evolution/:id',md_auth.ensureAuth, EvolutionController.getEvolution);
api.get('/evolutions',md_auth.ensureAuth, EvolutionController.getEvolutions);
api.post('/evolution-add', md_auth.ensureAuthAdmin, EvolutionController.addEvolution);

module.exports = api;