'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require ('../models/user');
var jwt = require ('../services/jwt');
var global = require ('../services/global');



function addUser (req, res){
    var user = new User();
    var params = req.body; //Recogemos los datos que llegan por POST

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;    
    user.image = 'null';
    
    if (user.name && user.surname && user.email && params.password){
        //Encriptación de la contraseña
        bcrypt.hash(params.password,null,null, function (err, result){
            if(err){
                console.log(err);
                res.status(500).send({message:'Error en la encriptación del password'});                
            }else{
                user.password = result;                
                user.save((err,userAdd) => {
                    if(err){
                        res.status(500).send({message:'Error al guardar el usuario'});
                    }else{
                        if(!userAdd){
                            res.status(404).send({message:'Usuario no registrado'});
                        }else{
                            res.status(200).send({user: userAdd});
                        }
                    }
                });
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios'});
    }
}

function loginUser (req, res){
    var params = req.body;

    var _email = params.email;
    var _password = params.password;

    User.findOne({email:_email.toLowerCase()},(err,user) => {
        if(err){
            console.log(err);
            res.status(500).send({message:'Error en la petición'});   
        }else{
            if (!user){
                res.status(404).send({message:'Usuario no existe'});
            }else{
                //Comprobamos la contraseña
                bcrypt.compare(_password,user.password, (err,check) => {
                    if(check){                        
                        if(params.gethash){
                            //Devolver token de jwt
                            res.status(200).send({
                                token: jwt.createToken(user)                                
                            });
                        }else{
                            //Devolver usuario logueado
                            res.status(200).send({user});
                        }
                    }else{
                        res.status(404).send({message:'Contraseña incorrecta'});
                    }
                });
            }
        }
    })
}

function updateUser (req, res){
    var userId = req.params.id || req.user.sub;
    var update = req.body;     

    User.findByIdAndUpdate(userId,update,(err,userUpdate) => {
        if (err){
            console.log(err);
            res.status(500).send({message:'Error al actualizar el usuario'}); 
        }else{
            if(!userUpdate){
                res.status(404).send({message: 'No se ha podido actualizar el usuario'});
            }else{
                res.status(200).send({user:userUpdate});
            }
        }
    })
}

function uploadIUser (req, res){
    var userId = req.user.sub;
    var file_name = 'No subido...';

    if (req.files.image){
        var file_path = req.files.image.path;
        var file_name = file_path.split('\/')[2];
        var ext = file_name.split('\.')[1];

        if (ext=='png' || ext=='jpg' || ext=='gif'){
            User.findByIdAndUpdate(userId,{image:file_name}, (err,userUpdate) => {
                if (err){
                    console.log(err);
                    res.status(500).send({message:'Error al actualizar la imagen del usuario'}); 
                }else{
                    if(!userUpdate){
                        res.status(404).send({message: 'No se ha podido actualizar la imagen del usuario'});
                    }else{
                        res.status(200).send({image:file_name, user:userUpdate});
                    }
                }
            });
        }else{
            res.status(200).send({message:'Extensión del archivo no valida (.png .jpg .gif'});
        }        
    }else{
        res.status(200).send({message:'Imagen no subida'});
    }
}

function loadIUser (req, res){
    var imageFile = req.params.imageFile;
    var path_file = global.PATH_FILE_USER + imageFile;

    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(200).send({message:'La imagen no existe'}); 
        }
    });
}

module.exports = {    
    addUser,
    loginUser,
    updateUser,
    uploadIUser,
    loadIUser
};