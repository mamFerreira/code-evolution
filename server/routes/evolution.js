'use strict'

var express = require ('express');

var md_auth = require ('../middlewares/authenticated');
var EvolutionController = require ('../controllers/evolution');

var api = express.Router();

api.post('/evolution-add', md_auth.ensureAuthAdmin, EvolutionController.addEvolution);

module.exports = api;