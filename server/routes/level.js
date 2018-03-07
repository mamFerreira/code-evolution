'use strict'

var express = require ('express');
var multipart = require('connect-multiparty');

var md_auth = require ('../middlewares/authenticated');
var LevelController = require ('../controllers/level');
var global = require ('../services/global');

var md_upload_C = multipart({uploadDir: global.PATH_FILE_LEVEL_C});
var md_upload_I = multipart({uploadDir: global.PATH_FILE_LEVEL_I});
var md_upload_M = multipart({uploadDir: global.PATH_FILE_LEVEL_M});

var api = express.Router();

// Operaciones CRUD
api.post('/level-add', md_auth.ensureAuthAdmin, LevelController.addLevel);
api.get('/level/:id',md_auth.ensureAuth, LevelController.getLevel);
api.get('/levels',md_auth.ensureAuthAdmin, LevelController.getLevels);
api.get('/levels/:evolution',md_auth.ensureAuth, LevelController.getLevelsByEvolution);
api.put('/level-update/:id', md_auth.ensureAuthAdmin ,LevelController.updateLevel);
api.delete('/level-remove/:id', md_auth.ensureAuthAdmin ,LevelController.removeLevel);
// Operaciones Especiales
api.get('/level-active/:id',md_auth.ensureAuthAdmin, LevelController.activeLevel);
api.get('/level-desactive/:id',md_auth.ensureAuthAdmin, LevelController.desactiveLevel);
api.post('/level-translate/:id',md_auth.ensureAuth, LevelController.translateCode);
api.post('/level-upload-code/:id', [md_auth.ensureAuthAdmin,md_upload_C], LevelController.uploadCode);
api.get('/level-load-code/:id',md_auth.ensureAuth, LevelController.loadCode);
api.get('/level-next/:id', md_auth.ensureAuth,LevelController.nextLevel);
// Operaciones de edición
api.post('/position-add/:level', md_auth.ensureAuthAdmin, LevelController.addPosition);
api.delete('/position-remove/:id', md_auth.ensureAuthAdmin ,LevelController.removePosition);    
api.get('/positions/:level',md_auth.ensureAuth, LevelController.getPositions);
api.post('/level-goal-add', md_auth.ensureAuthAdmin, LevelController.addGoal);
api.delete('/level-goal-remove/:id', md_auth.ensureAuthAdmin ,LevelController.removeGoal);    
api.post('/level-learning-add', md_auth.ensureAuthAdmin, LevelController.addLearning);
api.delete('/level-learning-remove/:id', md_auth.ensureAuthAdmin ,LevelController.removeLearning);    
api.post('/level-action-add', md_auth.ensureAuthAdmin, LevelController.addAction);
api.delete('/level-action-remove/:id', md_auth.ensureAuthAdmin ,LevelController.removeAction);  
//Operaciones de carga y subida de ficheros
api.post('/level-upload-I/:id', [md_auth.ensureAuthAdmin,md_upload_I], LevelController.uploadILevel);  
api.post('/level-upload-M/:id', [md_auth.ensureAuthAdmin,md_upload_M], LevelController.uploadMapLevel);  
api.get('/level-load/:nameFile/:type',LevelController.loadFileLevel);
api.get('/level-load-id/:id/:type',LevelController.loadFileLevel);

module.exports = api;