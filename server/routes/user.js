'use strict'

var express = require ('express');
var md_auth = require ('../middlewares/authenticated');
var UserController = require ('../controllers/user');

var api = express.Router();

api.post('/user-add', UserController.addUser);
api.get('/users-get/:id?', md_auth.ensureAuthAdmin, UserController.getUsers);
api.put('/user-update', md_auth.ensureAuth ,UserController.updateUser);
api.put('/user-update/:id', md_auth.ensureAuthAdmin ,UserController.updateUser);
api.delete('/user-remove/:id', md_auth.ensureAuthAdmin, UserController.removeUser);
api.post('/user-login', UserController.loginUser);
api.get('/user-check-token', UserController.checkToken)

module.exports = api;