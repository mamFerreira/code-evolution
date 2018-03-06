'use strict'

var express = require ('express');
var multipart = require('connect-multiparty');

var md_auth = require ('../middlewares/authenticated');
var ActionController = require ('../controllers/action');

var api = express.Router();

api.post('/action-add', md_auth.ensureAuthAdmin, ActionController.addAction);
api.get('/action/:id',md_auth.ensureAuth, ActionController.getAction);
api.get('/actions/:level?',md_auth.ensureAuth, ActionController.getActions);
api.put('/action-update/:id', md_auth.ensureAuthAdmin ,ActionController.updateAction);
api.delete('/action-remove/:id', md_auth.ensureAuthAdmin ,ActionController.removeAction);

module.exports = api;