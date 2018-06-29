'use strict'

var express = require ('express');
var multipart = require('connect-multiparty');

var md_auth = require ('../middlewares/authenticated');
var EvolutionController = require ('../controllers/evolution');
var GLOBAL = require ('../services/global');

var api = express.Router();
var md_upload = multipart({uploadDir: GLOBAL.PATH_FILE_EVOLUTION});

// Operaciones CRUD
api.post('/evolution-add', md_auth.ensureAuthAdmin, EvolutionController.addEvolution);
api.get('/evolutions-get/:id?',md_auth.ensureAuth, EvolutionController.getEvolutions);
api.get('/evolutions-get-order/:order?',md_auth.ensureAuth, EvolutionController.getEvolutions);
api.put('/evolution-update/:id', md_auth.ensureAuthAdmin ,EvolutionController.updateEvolution);
api.delete('/evolution-remove/:id', md_auth.ensureAuthAdmin ,EvolutionController.removeEvolution);

// Operaciones sobre ficheros
api.post('/evolution-upload/:id', [md_auth.ensureAuthAdmin,md_upload], EvolutionController.uploadEvolution);
api.get('/evolution-load/:id',EvolutionController.loadEvolution);

// Operaciones especiales
api.get('/evolution-learning/:id',md_auth.ensureAuth, EvolutionController.getEvolutionLearning);
api.get('/evolution-action/:id',md_auth.ensureAuth, EvolutionController.getEvolutionAction);

module.exports = api;