'use strict'

var express = require ('express');
var md_auth = require ('../middlewares/authenticated');
var LearningController = require ('../controllers/learning');

var api = express.Router();

api.post('/learning-add', md_auth.ensureAuthAdmin, LearningController.addLearning);
api.get('/learnings-get/:id?',md_auth.ensureAuth, LearningController.getLearnings);
api.put('/learning-update/:id', md_auth.ensureAuthAdmin ,LearningController.updateLearning);
api.delete('/learning-remove/:id', md_auth.ensureAuthAdmin ,LearningController.removeLearning);

module.exports = api;