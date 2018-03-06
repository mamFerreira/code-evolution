'use strict'

var express = require ('express');
var multipart = require('connect-multiparty');

var md_auth = require ('../middlewares/authenticated');
var EvolutionController = require ('../controllers/evolution');
var global = require ('../services/global');

var api = express.Router();
var md_upload_I = multipart({uploadDir: global.PATH_FILE_EVOLUTION_I});
var md_upload_P = multipart({uploadDir: global.PATH_FILE_EVOLUTION_P});
var md_upload_T = multipart({uploadDir: global.PATH_FILE_EVOLUTION_T});

// Operaciones CRUD
api.post('/evolution-add', md_auth.ensureAuthAdmin, EvolutionController.addEvolution);
api.get('/evolution/:id',md_auth.ensureAuth, EvolutionController.getEvolution);
api.get('/evolutions',md_auth.ensureAuth, EvolutionController.getEvolutions);
api.put('/evolution-update/:id', md_auth.ensureAuthAdmin ,EvolutionController.updateEvolution);
api.delete('/evolution-remove/:id', md_auth.ensureAuthAdmin ,EvolutionController.removeEvolution);

// Operaciones especiales
api.get('/evolution-num-levels/:id',md_auth.ensureAuth,EvolutionController.getNumLevels);
api.get('/evolution-learning/:id',md_auth.ensureAuth, EvolutionController.getEvolutionLearning);
api.get('/evolution-action/:id',md_auth.ensureAuth, EvolutionController.getEvolutionAction);

// Operaciones subida de imágenes
api.post('/evolution-upload-I/:id', [md_auth.ensureAuthAdmin,md_upload_I], EvolutionController.uploadIEvolution);
api.post('/evolution-upload-P/:id', [md_auth.ensureAuthAdmin,md_upload_P], EvolutionController.uploadPEvolution);
api.post('/evolution-upload-T/:id/:type', [md_auth.ensureAuthAdmin,md_upload_T], EvolutionController.uploadTEvolution);

// Operaciones carga de imágenes
api.get('/evolution-load/:imageFile/:type',EvolutionController.loadEvolution);
api.get('/evolution-load-id/:id/:type',EvolutionController.loadEvolution);


module.exports = api;