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
api.put('/user-update/:id?', md_auth.ensureAuth ,UserController.updateUser);
api.post('/user-upload', [md_auth.ensureAuth,md_upload], UserController.uploadIUser);
api.get('/user-load/:imageFile',UserController.loadIUser);

module.exports = api;
