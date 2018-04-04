'use strict'

var fs = require('fs');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var User = require ('../models/user');
var Level = require ('../models/level');
var GLOBAL = require ('../services/global');
var jwt = require ('../services/jwt');
var jwt_simple = require('jwt-simple');
var moment = require('moment');
var token_key = 'C0D3-3V0LUT10N';
var table = 'User';


/**
 * Añadir nuevo usuario
 * @returns user: Usuario creado
 */
function addUser (req, res){
    var user = new User();
    var params = req.body; //Recogemos los datos que llegan por POST

    user.name = params.name;
    user.surname = params.surname;
    user.email = params.email;    
    user.image = '';
    
    if (user.name && user.surname && user.email && params.password){

        //Comprobamos si existe usuario con mismo email
        User.findOne({email:user.email.toLowerCase()},(err,user_db) => {
            if(err){                
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});  
            }else{
                if (user_db){
                    res.status(404).send({message:'Ya existe un usuario con el email ' + user.email});
                }else{
                    //Encriptación de la contraseña
                    bcrypt.hash(params.password,null,null, function (err, result){
                        if(err){                            
                            res.status(500).send({message:'Error en la encriptación del password'});                
                        }else{
                            user.password = result;                
                            user.save((err,userAdd) => {
                                if(err){
                                    res.status(500).send({message:'Error al guardar el usuario',messageError: err.message});
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
                }
            }
        });        
    }else{
        res.status(404).send({message:'Rellena los campos obligatorios'});
    }
}

/**
 * Login usuario
 * @returns token: Token creado si gethash == true. user: Usuario logueado si gethash == false
 */
function loginUser (req, res){
    var params = req.body;

    var _email = params.email;
    var _password = params.password;

    User.findOne({email:_email.toLowerCase(), active:1}).populate({path : 'level', populate : {path : 'evolution'}}).exec((err,user) => {            
        if(err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});    
        }else{
            if (!user){
                res.status(400).send({message:'Usuario no existe'});
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
                            res.status(200).send({user});
                        }
                    }else{
                        res.status(400).send({message:'Contraseña incorrecta'});
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
    
    var token = req.headers.authorization.replace(/['"]+/g,'');    

    try{
        var _payload = jwt_simple.decode(token,token_key);

        if (_payload.exp <= moment().unix()){
            return res.status(200).send({check:false, message: 'Token expirado'});
        }

    }catch(ex){                
        return res.status(200).send({check:false, message: ex.message});        
    }

    res.status(200).send({check:true});

}

/**
 * Obtener usuario
 * @param id: Identificador del usuario deseado
 * @returns user: Usuario solicitado
 */
function getUser (req,res){
    var id = req.params.id;

    User.findById(id).exec((err,tuple)=>{
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(!tuple){
                res.status(404).send({message: 'No existe tupla con dicho identificador: ' + table}); 
            }else{                
                res.status(200).send({user: tuple});              
            }
        }
    });
}

/**
 * Obtener todos los usuarios registrados en el sistema
 * @returns users: Listado de usuario
 */
function getUsers (req, res){
    User.find({}).populate({path : 'level', populate : {path : 'evolution'}}).exec((err,tuples) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});    
        }else{
            if (tuples.length==0){
                res.status(404).send({message: 'Ningun usuario registrado'});
            }else{
                res.status(200).send({users: tuples});
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
    if (!req.params.id && update.role){
        delete update.role
    }

    if (update.name.length>0 && update.email.length>0){
        User.findByIdAndUpdate(id,update,(err,userUpdate) => {
            if (err){
                res.status(500).send({message: 'Error al actulizar el usuario', messageError: err.message});
            }else{
                if(!userUpdate){
                    res.status(404).send({message: 'No se ha podido actualizar el usuario: '});
                }else{
                    res.status(200).send({user:userUpdate});
                }
            }
        });
    } else {
        res.status(200).send({message:'Los campos nombre y email son obligatorios'});
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
        User.findByIdAndRemove(id,(err,tupleRemove) => {
            if (err){
                res.status(500).send({message:'Error al eliminar: ' + table, messageError: err.message}); 
            }else{
                if(!tupleRemove){
                    res.status(404).send({message: 'Error al eliminar: ' + table});
                }else{                
                    res.status(200).send({user:tupleRemove});
                }
            }
        });
    }else{
        res.status(500).send({message:'Error al eliminar usuario: no se puede eliminar el usuario administrador'}); 
    }
}

/**
 * Activar un usuario
 * @returns user: Usuario antes de actualizar
 */
function activateUser (req, res) {
    var id = req.params.id;
    var query = {active:1};

    User.findByIdAndUpdate(id,query,(err,userUpdate) => {
        if (err){
            res.status(500).send({message: 'Error al activar el usuario', messageError: err.message});
        }else{
            if(!userUpdate){
                res.status(404).send({message: 'No se ha podido activar el usuario'});
            }else{
                res.status(200).send({user:userUpdate});
            }
        }
    })
}

/**
 * Desactivar un usuario
 * @returns user: Usuario antes de actualizar
 */
function desactivateUser (req, res) {
    var id = req.params.id;
    var query = {active:0};

    User.findByIdAndUpdate(id,query,(err,userUpdate) => {
        if (err){
            res.status(500).send({message: 'Error al desactivar el usuario', messageError: err.message});
        }else{
            if(!userUpdate){
                res.status(404).send({message: 'No se ha podido desactivar el usuario'});
            }else{
                res.status(200).send({user:userUpdate});
            }
        }
    })
}

/**
 * Subir imagen de usuario
 * @returns image: Nombre de la imagen. user: Usuario sin actualizar
 */
function uploadIUser (req, res){
    var userId = req.user.sub;
    var file_name = 'No subido...';

    if (req.files.image){
        var file_path = req.files.image.path;
        var file_name = file_path.split('\/')[2];
        var ext = file_name.split('\.')[1];

        if (ext=='png' || ext=='jpg' || ext=='gif'){
            User.findByIdAndUpdate(userId,{image:file_name}, (err,tupleUpdate) => {
                if (err){
                    res.status(500).send({message: 'Error al subir imagen de usuario', messageError: err.message}); 
                }else{
                    if(!tupleUpdate){                        
                        res.status(404).send({message: 'No se ha podido actualizar la imagen del usuario'});
                    }else{                        
                        let file_path_old = GLOBAL.PATH_FILE_USER + tupleUpdate.image;                        
                        fs.exists(file_path_old, (exists) => {
                            if(exists){
                                fs.unlink(file_path_old)
                            }
                        });
                        res.status(200).send({image:file_name, user:tupleUpdate});
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

/**
 * Cargar imagen de usuario
 * @return imagen de usuario
 */
function loadIUser (req, res){
    var imageFile = req.params.imageFile;
    var path_file = GLOBAL.PATH_FILE_USER + imageFile;

    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({message:'La imagen no existe'}); 
        }
    });
}

module.exports = {    
    addUser,
    loginUser,
    checkToken,
    getUser,
    getUsers,
    updateUser,
    removeUser,
    activateUser,
    desactivateUser,
    uploadIUser,
    loadIUser
};