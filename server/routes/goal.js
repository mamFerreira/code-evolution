'use strict'

var express = require ('express');
var multipart = require('connect-multiparty');

var md_auth = require ('../middlewares/authenticated');
var GoalController = require ('../controllers/goal');

var api = express.Router();

api.post('/goal-add', md_auth.ensureAuthAdmin, GoalController.addGoal);
api.get('/goal/:id',md_auth.ensureAuth, GoalController.getGoal);
api.get('/goals/:level?',md_auth.ensureAuth, GoalController.getGoals);
api.put('/goal-update/:id', md_auth.ensureAuthAdmin ,GoalController.updateGoal);
api.delete('/goal-remove/:id', md_auth.ensureAuthAdmin ,GoalController.removeGoal);

module.exports = api;