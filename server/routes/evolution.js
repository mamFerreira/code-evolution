'use strict'

var express = require ('express');
var multipart = require('connect-multiparty');

var md_auth = require ('../middlewares/authenticated');
var EvolutionController = require ('../controllers/evolution');
var global = require ('../services/global');

var api = express.Router();
var md_upload = multipart({uploadDir: global.PATH_FILE_EVOLUTION});


api.get('/evolution/:id',md_auth.ensureAuth, EvolutionController.getEvolution);
api.get('/evolutions',md_auth.ensureAuth, EvolutionController.getEvolutions);
api.get('/evolution-num-levels/:id',md_auth.ensureAuth,EvolutionController.getNumLevels);
api.post('/evolution-add', md_auth.ensureAuthAdmin, EvolutionController.addEvolution);
api.put('/evolution-update/:id', md_auth.ensureAuthAdmin ,EvolutionController.updateEvolution);
api.post('/evolution-upload/:id/:type', [md_auth.ensureAuthAdmin,md_upload], EvolutionController.uploadIEvolution);
api.get('/evolution-load/:imageFile',EvolutionController.loadIEvolution);
api.get('/evolution-load/:id/:type',EvolutionController.loadIEvolution);

module.exports = api;