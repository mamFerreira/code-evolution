'use strict'

var express = require ('express');
var multipart = require('connect-multiparty');

var md_auth = require ('../middlewares/authenticated');
var UserController = require ('../controllers/user');
var global = require ('../services/global');

var api = express.Router();
var md_upload = multipart({uploadDir: global.PATH_FILE_USER});

api.post('/user-add', UserController.addUser);
api.post('/user-login', UserController.loginUser);
api.get('/user-check-token', UserController.checkToken)
api.get('/user/:id', md_auth.ensureAuthAdmin, UserController.getUser);
api.get('/users', md_auth.ensureAuthAdmin, UserController.getUsers);
api.put('/user-update/:id', md_auth.ensureAuthAdmin ,UserController.updateUser);
api.put('/user-update', md_auth.ensureAuth ,UserController.updateUser);
api.delete('/user-remove/:id', md_auth.ensureAuthAdmin, UserController.removeUser);
api.get('/user-activate/:id', md_auth.ensureAuthAdmin, UserController.activateUser);
api.get('/user-desactivate/:id', md_auth.ensureAuthAdmin, UserController.desactivateUser);
api.post('/user-upload', [md_auth.ensureAuth,md_upload], UserController.uploadIUser);
api.get('/user-load/:imageFile',UserController.loadIUser);

module.exports = api;