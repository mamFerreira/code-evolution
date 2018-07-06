'use strict'

var mongo = require('mongodb');
var bcrypt = require('bcrypt-nodejs');
var jwt_simple = require('jwt-simple');
var moment = require('moment');
var jwt = require ('../services/jwt');
var GLOBAL = require ('../services/global');
var User = require ('../models/user');
var Game = require ('../models/game');

//#region OPERACIONES CRUD

/**
 * Añadir nuevo usuario
 * @returns user: Usuario creado
 */
function addUser (req, res){
    var user = new User();
    var params = req.body; //Recogemos los datos que llegan por POST

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email.toLowerCase();
    user.counterLogin = 0;            
    
    if (user.name.length > 0 && user.email.length > 0 && params.password.length > 0){

        //Comprobamos si existe usuario con mismo email
        User.findOne({email:user.email},(err,user_db) => {
            if(err){                
                res.status(500).send({message:'Error en el servidor', messageError:err.message});  
            }else{
                if (user_db){
                    res.status(200).send({message:'Error: Existe otro usuario con el correo ' + user.email});
                }else{
                    //Encriptación de la contraseña
                    bcrypt.hash(params.password,null,null, function (err, result){
                        if(err){                            
                            res.status(500).send({message: 'Error en el servidor', messageError:err.message});                
                        }else{
                            user.password = result;                
                            user.save((err,userAdd) => {
                                if(err){                                    
                                    res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                                }else{
                                    if(!userAdd){
                                        res.status(404).send({message:'Error: El usuario no ha sido creado'});
                                    }else{
                                        var game = new Game();
                                        game.overcome = false;    
                                        game.userID = userAdd._id;
                                        game.levelID = GLOBAL.ID_FIRST_LEVEL; 
                                        game.save((err,gameAdd) => {
                                            if(err){
                                                res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                                            }else{
                                                if(!gameAdd){
                                                    res.status(404).send({message:'Error: La partida no ha sido creada'});
                                                }else{
                                                    res.status(200).send({user: userAdd});
                                                }
                                            }
                                        });                                        
                                    }
                                }
                            });
                        }
                    });
                }
            }
        });        
    }else{
        res.status(404).send({message:'Rellena los campos obligatorios'});
    }
}

/**
 * Obtener usuarios registrados
 * @param id: Identificador del usuario deseado (opcional)
 * @returns users: Listado de usuario
 */
function getUsers (req, res){    
    var query = {}

    if (req.params.id){
        var o_id = new mongo.ObjectID(req.params.id);
        query = { '_id' : o_id };
    }    

    User.find(query).exec((err,users) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{
            if (!users){
                res.status(200).send({message: 'Ningún usuario registrado en el sistema'});
            }else{
                res.status(200).send({users});                
            }
        }
    });
}

/**
 * Actualizar usuario indicado por parámetro (o en req si es el propio)
 * @returns user: Usuario antes de actualizar
 */
function updateUser (req, res){    

    var id = req.params.id || req.user.sub;
    var update = req.body; 

    // Eliminanos la propiedad para que los usuarios normales no puedan modificar su rol
    if (!req.params.id && update.admin){
        delete update.admin
    }

    if (update.name && update.email){
        User.findByIdAndUpdate(id,update,(err,user) => {
            if (err){
                res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
            }else{
                if(!user){
                    res.status(404).send({message: 'Error: el usuario no ha podido ser actualizado'});
                }else{
                    res.status(200).send({user});
                }
            }
        });
    } else {
        res.status(200).send({message:'Error: Los campos nombre y email son obligatorios'});
    }
}

/**
 * Eliminar usuario
 * @param id: Identificador del usuario a eliminar
 * @param user: Usuario elimado
 */
function removeUser (req, res){
    var id = req.params.id;

    if (id !== GLOBAL.ID_USER_ADMIN){
        User.findByIdAndRemove(id,(err,user) => {
            if (err){
                res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
            }else{
                if(!user){
                    res.status(404).send({message: 'Error: No ha podido eliminarse el registro'}); 
                }else{  
                    Game.remove({userID:id});  // Eliminamos todas su partidas          
                    res.status(200).send({user});
                }
            }
        });
    }else{
        res.status(200).send({message:'Error: administrador principal no puede ser eliminado'}); 
    }
}

//#endregion

//#region OTRAS

/**
 * Login usuario
 * @returns token: Token creado si gethash == true. user: Usuario logueado si gethash == false
 */
function loginUser (req, res){
    var params = req.body;

    var _gethash = params.gethash;
    var _email = params.email;
    var _password = params.password;

    User.findOne({email:_email.toLowerCase()}).exec((err,user) => {            
        if(err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{            
            if (!user){
                res.status(200).send({message:'El usuario con email ' + _email + ' no existe.'});
            }else{
                //Comprobamos la contraseña                
                bcrypt.compare(_password,user.password, (err,check) => {
                    if (err){
                        res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                    }else{
                        if(check){       
                            //Devolver token de jwt                 
                            if(_gethash){                                
                                res.status(200).send({
                                    token: jwt.createToken(user)                                
                                });
                            }else{                    
                                // Actualizamos contador y fecha de último registro
                                user.counterLogin = user.counterLogin + 1;
                                user.lastLogin = new Date();

                                User.findByIdAndUpdate(user.id,user,(err,userUpdate) => {
                                    if (err){
                                        res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
                                    }else{
                                        if(!userUpdate){
                                            res.status(404).send({message: 'Error: el usuario no ha podido ser actualizado'});
                                        }else{
                                            res.status(200).send({user});
                                        }
                                    }
                                });                                                                
                            }
                        }else{
                            res.status(400).send({message:'Contraseña incorrecta'});
                        }
                    }                    
                });
            }
        }
    });
}

/**
 * Comprobar si el token es correcto y no ha expirado
 * @returns check: True si es correcto, false en caso contrario
 */
function checkToken (req, res){                
    try{
        var token = req.headers.authorization.replace(/['"]+/g,'');                
        var _payload = jwt_simple.decode(token,GLOBAL.TOKEN_KEY);

        if (_payload.exp <= moment().unix()){
            return res.status(200).send({check:false, message: 'Token expirado'});
        }

    }catch(ex){          
        return res.status(200).send({check:false, message: ex.message});        
    }

    res.status(200).send({check:true});

}

//#endregion


module.exports = {    
    addUser,    
    getUsers,
    updateUser,
    removeUser, 
    loginUser,
    checkToken               
};