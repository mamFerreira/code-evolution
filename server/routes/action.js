'use strict'

var express = require ('express');
var md_auth = require ('../middlewares/authenticated');
var ActionController = require ('../controllers/action');

var api = express.Router();

api.post('/action-add', md_auth.ensureAuthAdmin, ActionController.addAction);
api.get('/actions-get/:id?',md_auth.ensureAuth, ActionController.getActions);
api.put('/action-update/:id', md_auth.ensureAuthAdmin ,ActionController.updateAction);
api.delete('/action-remove/:id', md_auth.ensureAuthAdmin ,ActionController.removeAction);

module.exports = api;