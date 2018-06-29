'use strict'

var express = require ('express');
var multipart = require('connect-multiparty');

var md_auth = require ('../middlewares/authenticated');
var LevelController = require ('../controllers/level');
var GLOBAL = require ('../services/global');

var md_upload = multipart({uploadDir: GLOBAL.PATH_FILE_LEVEL});

var api = express.Router();


api.post('/level-add', md_auth.ensureAuthAdmin, LevelController.addLevel);
api.get('/level-get/:id?',md_auth.ensureAuth, LevelController.getLevels);
api.get('/level-evolution-get/:evolutionID',md_auth.ensureAuth, LevelController.getLevels);
api.get('/level-evolution-order-get/:evolutionID/:order',md_auth.ensureAuth, LevelController.getLevels);
api.put('/level-update/:id', md_auth.ensureAuthAdmin ,LevelController.updateLevel);
api.delete('/level-remove/:id', md_auth.ensureAuthAdmin ,LevelController.removeLevel);
api.post('/level-upload/:id', [md_auth.ensureAuthAdmin,md_upload], LevelController.uploadLevel);  
api.get('/level-load/:id',LevelController.loadLevel);

api.post('/level-action-add', md_auth.ensureAuthAdmin, LevelController.addAction);
api.get('/level-actions-get/:levelID',md_auth.ensureAuth, LevelController.getActions);
api.delete('/level-action-remove/:id', md_auth.ensureAuthAdmin ,LevelController.removeAction); 

api.post('/level-learning-add', md_auth.ensureAuthAdmin, LevelController.addLearning);
api.get('/level-learnings-get/:levelID',md_auth.ensureAuth, LevelController.getLearnings);
api.delete('/level-learning-remove/:id', md_auth.ensureAuthAdmin ,LevelController.removeLearning); 

api.post('/level-goal-add', md_auth.ensureAuthAdmin, LevelController.addGoal);
api.get('/level-goals-get/:levelID',md_auth.ensureAuth, LevelController.getGoals);
api.delete('/level-goal-remove/:id', md_auth.ensureAuthAdmin ,LevelController.removeGoal); 

module.exports = api;