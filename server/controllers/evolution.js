'use strict'

var fs = require('fs');
var path = require('path');
var async = require('async');
var ObjectID = require('mongodb').ObjectID;
var User = require ('../models/user');
var Evolution = require ('../models/evolution');
var Level = require ('../models/level');
var LevelLearning = require ('../models/level_learning');
var GLOBAL = require ('../services/global');
var table = 'evolution';


/**
 * Registrar nueva evolución en BBDD
 * @returns evolution: Evolución creada
 */
function addEvolution (req, res){
    var evolution = new Evolution();
    var params = req.body; //Recogemos los datos que llegan por POST

    evolution.order = params.order;
    evolution.name = params.name;
    evolution.description = params.description;    
    evolution.origin = params.origin;
    evolution.image = '';
    evolution.player = '';
    evolution.health = params.health;
    evolution.tiledset_surface = '';
    evolution.tiledset_block = '';


    if (evolution.order && evolution.name && params.health){
        Evolution.find({order:evolution.order},{_id: 1}).limit(1).exec( (err,tuple) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                if (tuple.length == 0) {
                    evolution.save((err,tupleAdd) => {
                        if (err){
                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                        }else{
                            if (!tupleAdd){
                                res.status(404).send({message:'Tupla no registrada: ' + table});
                            }else{
                                res.status(200).send({evolution: tupleAdd});
                            }
                        }
                    });
                }else{
                    res.status(200).send({message:'Ya existe una evolución registrada con orden ' + evolution.order});                    
                }
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios: order, name, health'});
    }
}

/**
 * Obtener evolución a partir de id (controlar que el usuario tiene permiso de acceso)
 * @returns evolution: evolución asociada al id
 */
function getEvolution (req, res){
    var id = req.params.id;

    Evolution.findById(id).exec((err,tuple_evolution)=>{
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(!tuple_evolution){
                res.status(404).send({message: 'No existe tupla con dicho identificador: ' + table});  
            }else{
                if (req.user.role != 'ROLE_ADMIN'){
                    User.findById(req.user.sub).populate({path:'level', populate : [ {path: 'evolution'}]}).exec((err,tuple_user) => {
                        if (err) {
                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                        }else{
                            if(!tuple_user){
                                res.status(404).send({message: 'No existe tupla con dicho identificador: User'});  
                            }else{
                                if (tuple_evolution.order > tuple_user.level.evolution.order){
                                    res.status(401).send({message:"Sin permisos de acceso a la evolución"});
                                }else{
                                    res.status(200).send({evolution: tuple_evolution});
                                }                                
                            }
                        }
                    });                     
                }else{
                    res.status(200).send({evolution: tuple_evolution});
                }              
            }
        }
    });
}

/**
 * Obtener todas las evoluciones disponibles para el usuario (Administrados con acceso a todas) añadiendo la información sobre el número de niveles asociados
 * @returns evolutions: Evoluciones registradas en el sistema
 */
function getEvolutions (req, res){
    var query = {};

    if (req.user.role != 'ROLE_ADMIN'){
                        
        User.findById(req.user.sub).populate({path:'level', populate : [ {path: 'evolution'}]}).exec((err,tuple_user) => {
            if (err) {
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                if(!tuple_user){
                    res.status(404).send({message: 'No existe tupla con dicho identificador: User'});  
                }else{
                    getEvolutions_2(req,res,{'order':{$lte:tuple_user.level.evolution.order}});
                }
            }
        });     


    }else {
        getEvolutions_2(req, res, {})
    }  
}

function getEvolutions_2 (req, res, query){
    Evolution.find(query).sort('order').exec((err,tuples) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(tuples.length==0){
                res.status(404).send({message: 'Ninguna evolución cumple los requisitos'}); 
            }else{                   
                async.forEachOf(tuples, (element, key, callback) => {
                    Level.find({evolution:element._id, active:1}, {_id: 1}).count((err,count) => {
                        if(err){
                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                        }else{
                            element.numLevels = count;
                        }                                                                                            
                        callback();     
                    });
                }, (err) => {
                    res.status(200).send({evolutions:tuples});
                });
            }
        }
    });
}

/**
 * Obtener el numero de evoluciones dadas de alta
 * @returns num_evolutions: Numeros de evoluciones en BBDD
 */
function getNumEvolutions (req, res){

    Evolution.find({}).count().exec((err,num) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(!num){
                res.status(404).send({message: 'Ninguna evolución cumple los requisitos'}); 
            }else{                   
                res.status(200).send({num_evolutions:num});
            }
        }
    });
}

/**
 * Actualizar evolución
 * @returns evolution: Evolución antes de la actualización
 */
function updateEvolution (req,res){
    var id = req.params.id;
    var update = req.body; 
    
    if (update.order != 'null' && update.name.length>0 && update.health != 'null'){
        Evolution.findByIdAndUpdate( id, update, (err,tupleUpdate) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                if(!tupleUpdate){
                    res.status(404).send({message: 'Error al actualizar: ' + table});
                }else{
                    res.status(200).send({evolution:tupleUpdate});
                }
            }
        });
    } else {
        res.status(200).send({message:'Rellena los campos obligatorios: order, name, health'});
    }
}


/**
 * Eliminar evolución
 * @param id: Identificador de la evolución a eliminar
 * @param evolution: Evolución elimada
 */
function removeEvolution (req, res){
    var id = req.params.id;

    Level.find({evolution:id}, {_id: 1}).count((err,count) => {
        if (err){
            res.status(500).send({message:'Error en el servidor: ' + table, messageError: err.message}); 
        }else{
            if(!count){
                count = 0;
            }
            if (count > 0){
                res.status(404).send({message: 'Error al eliminar evolución: debe eliminar antes sus niveles asociados'});
            }else{
                Evolution.findByIdAndRemove(id,(err,tupleRemove) => {
                    if (err){
                        res.status(500).send({message:'Error al eliminar: ' + table, messageError: err.message}); 
                    }else{
                        if(!tupleRemove){
                            res.status(404).send({message: 'Error al eliminar: ' + table});
                        }else{            
                            res.status(200).send({evolution:tupleRemove});
                        }
                    }
                });
            }            
        }
    });
}

/**
 * Obtener el número de niveles de la evolución indicada
 * @returns count: Número de niveles
 */
function getNumLevels (req, res){
    var id = req.params.id;

    Level.find({evolution:id, active:1}, {_id: 1}).count((err,count) => {
        if (err){
            res.status(500).send({message:'Error en el servidor: ' + table, messageError: err.message}); 
        }else{
            if(!count){
                count = 0;
            }
            res.status(200).send({count});
        }
    });
}

 /**
  * Obtener listado con el aprendizaje asociado a la evolución
  * @returns learnings: Listado de aprendizaje asociado a la evolución
  */
function getEvolutionLearning (req, res) {    
    var parama_id = new ObjectID(req.params.id);

    Level.aggregate([
        {$match:
            {'evolution': parama_id}
        },
        {$lookup:
            {
                from: 'level_learning',
                localField: '_id',
                foreignField: 'level',
                as: 'tmp'
            }
        },
        {
            $unwind: "$tmp"
        },
        {
            $lookup:{
                from: 'learnings',
                localField: "tmp.learning",
                foreignField: '_id',
                as: 'tmp2'
            }
        },
        { $sort : { 'tmp2.order' : -1 } },
        {
            $project: {
                "_id": 0,
                "tmp2": 1
            }
        },
        {
            $group: {_id: null, uniqueValues: {$addToSet: "$tmp2"}}
        },        
    ]).exec ((err,tuples) => {
        if (err){
            res.status(500).send({message:'Error en el servidor: ' + table, messageError: err.message});
        }else{
            if(!tuples){
                res.status(404).send({message: 'Error al obtener el aprendizaje asociado a la evolución'}); 
            }else{
                if (tuples.length == 0){
                    res.status(200).send({message: 'Evolución sin aprendizaje asociado'});
                }else{
                    var list = tuples[0].uniqueValues;
                    var json = [];                                

                    list.forEach(element => {
                        json.push(element[0]);
                    });
                    res.status(200).send({learnings: json});
                }                
            }
        } 
    });
    
}

 /**
  * Obtener listado con las funcionalidades disponibles en la evolución
  * @returns actions: Listado de acciones disponibles en la evolución
  */
function getEvolutionAction (req, res){
    var parama_id = new ObjectID(req.params.id);

    Level.aggregate([
        {$match:
            {'evolution': parama_id}
        },
        {$lookup:
            {
                from: 'level_action',
                localField: '_id',
                foreignField: 'level',
                as: 'tmp'
            }
        },
        {
            $unwind: "$tmp"
        },
        {
            $lookup:{
                from: 'actions',
                localField: "tmp.action",
                foreignField: '_id',
                as: 'tmp2'
            }
        },
        {
            $project: {
                "_id": 0,
                "tmp2": 1
            }
        },
        {
            $group: {_id: null, uniqueValues: {$addToSet: "$tmp2"}}
        }
               
    ]).exec ((err,tuples) => {
        if (err){
            res.status(500).send({message:'Error en el servidor: ' + table, messageError: err.message});
        }else{
            if(!tuples){
                res.status(404).send({message: 'Error al obtener las acciones asociadas a la evolución'}); 
            }else{
                if (tuples.length == 0){
                    res.status(404).send({message: 'No existen acciones asociadas a la evolución'});
                }else{
                    var list = tuples[0].uniqueValues;
                    var json = [];                                

                    list.forEach(element => {
                        json.push(element[0]);
                    });
                    res.status(200).send({actions: json});
                }                
            }
        } 
    });
}

/**
 * Subir imágen de la evolución a partir de su id
 * @returns image: Nombre de la imagen. 
 *          evolution: Evolución antes de la actualización.
 */
function uploadIEvolution (req,res){
    var id = req.params.id;
    var file_name = 'No subido...';
    var field;

    if (req.files.image){
        var file_path = req.files.image.path;        
        var file_name = file_path.split('\/')[3];
        var ext = file_name.split('\.')[1];        
        field = {image: file_name};                   
        if (ext=='png'){
            Evolution.findByIdAndUpdate(id, field, (err,tupleUpdate) => {
                if (err){
                    res.status(500).send({message:'Error en la subida de la imágen: ' + table, messageError: err.message});
                }else{
                    if(!tupleUpdate){
                        res.status(404).send({message: 'No se ha podido actualizar la imagen de la evolución'});
                    }else{
                        // Eliminamos la imagen anterior
                        let file_path_old = GLOBAL.PATH_FILE_EVOLUTION_I + tupleUpdate.image;
                        fs.exists(file_path_old, (exists) => {
                            if(exists){
                                fs.unlink(file_path_old)
                            }
                        });                                              
                        res.status(200).send({image:file_name, evolution:tupleUpdate});
                    }
                }
            });            
        }else{
            fs.unlink(file_path, (err) => {
                var msg = '';
                if (err){
                    msg = err.message;
                }
                res.status(200).send({message:'Extensión del archivo no válida (.png)' + msg});
            });            
        }        
    }else{
        res.status(200).send({message:'Imagen no subida'});
    }
}

/**
 * Subir imágen jugador de la evolución a partir de su id
 * @returns image: Nombre de la imagen.
 *          evolution: Evolución antes de la actualización.
 */
function uploadPEvolution (req,res){
    var id = req.params.id;
    var file_name = 'No subido...';
    var field;

    if (req.files.image){
        var file_path = req.files.image.path;
        var file_name = file_path.split('\/')[3];
        var ext = file_name.split('\.')[1];        
        field = {player: file_name};        

        if (ext=='png'){
            Evolution.findByIdAndUpdate(id, field, (err,tupleUpdate) => {
                if (err){
                    res.status(500).send({message:'Error en la subida de la imágen: ' + table, messageError: err.message});
                }else{
                    if(!tupleUpdate){
                        res.status(404).send({message: 'No se ha podido actualizar la imagen de la evolución'});
                    }else{
                        let file_path_old = GLOBAL.PATH_FILE_EVOLUTION_P + tupleUpdate.player;
                        fs.exists(file_path_old, (exists) => {
                            if(exists){
                                fs.unlink(file_path_old)
                            }
                        }); 
                        res.status(200).send({image:file_name, evolution:tupleUpdate});
                    }
                }
            });
        }else{
            res.status(200).send({message:'Extensión del archivo no válida (.png)'});
        }        
    }else{
        res.status(200).send({message:'Imagen no subida'});
    }
}

/**
 * Subir imágen tiledset (block o surface) de la evolución a partir de su id
 * @returns image: Nombre de la imagen. 
 *          evolution: Evolución antes de la actualización.
 */
function uploadTEvolution (req,res){
    var id = req.params.id;
    // var type = req.params.type;
    var file_name = 'No subido...';
    var field;

    if (req.files.image){
        var file_path = req.files.image.path;
        var file_name = file_path.split('\/')[3];
        var ext = file_name.split('\.')[1];   
        
        field = {tiledset: file_name};  

        if (ext=='png'){
            Evolution.findByIdAndUpdate(id, field, (err,tupleUpdate) => {
                if (err){
                    res.status(500).send({message:'Error en la subida de la imágen: ' + table, messageError: err.message});
                }else{
                    if(!tupleUpdate){
                        res.status(404).send({message: 'No se ha podido actualizar la imagen de la evolución'});
                    }else{
                        let file_path_old = GLOBAL.PATH_FILE_EVOLUTION_T + tupleUpdate.tiledset;
                        fs.exists(file_path_old, (exists) => {
                            if(exists){
                                fs.unlink(file_path_old)
                            }
                        });
                        res.status(200).send({image:file_name, evolution:tupleUpdate});
                    }
                }
            });
        }else{
            res.status(200).send({message:'Extensión del archivo no válida (.png)'});
        }        
    }else{
        res.status(200).send({message:'Imagen no subida'});
    }
}

/**
 * Cargar imagen de evolución
 * @return imagen de evolución
 */
function loadEvolution (req,res){

    //Obtener parametros
    var imageFile = req.params.imageFile;
    var type = req.params.type;
    var path_file;
    var global_path;
    var field;
    
    switch(type){
        case 'I':
            global_path = GLOBAL.PATH_FILE_EVOLUTION_I;            
            break;
        case 'P':
            global_path = GLOBAL.PATH_FILE_EVOLUTION_P;            
            break;
        //case 'TS':
        case 'T':
            global_path = GLOBAL.PATH_FILE_EVOLUTION_T;            
            break;
        default:
            return res.status(500).send({message: 'Error al cargar imágen: tipo indicado desconocido'});
    }


    if (!imageFile){
        var id = req.params.id;        

        Evolution.findById(id).exec((err,evolution)=>{            
            if (err){
                res.status(500).send({message:'Error en la carga de la imágen: ' + table, messageError: err.message});
            }else{
                if(!evolution){
                    res.status(404).send({message: 'No existe la evolución'}); 
                }else{        
                    
                    if (type == 'I'){
                        imageFile = evolution.image;
                    }
                    if (type == 'P'){
                        imageFile = evolution.player;
                    }
                    /*if (type == 'TS'){
                        imageFile = evolution.tiledset_surface;
                    }
                    if (type == 'TB'){
                        imageFile = evolution.tiledset_block;
                    }*/
                    if (type == 'T'){
                        imageFile = evolution.tiledset;
                    }                 
                    path_file = global_path + imageFile;                    
                    fs.exists(path_file, (exists) => {
                        if(exists){
                            res.sendFile(path.resolve(path_file));
                        }else{
                            res.status(404).send({message:'La imagen no existe'}); 
                        }
                    });                  
                }
            }
        });
    }else{
        path_file = global_path + imageFile;
        fs.exists(path_file, (exists) => {
            if(exists){
                res.sendFile(path.resolve(path_file));
            }else{
                res.status(404).send({message:'La imagen no existe'}); 
            }
        });
    }

    
}


module.exports = {
    addEvolution,
    getEvolution,
    getEvolutions,
    getNumEvolutions,
    updateEvolution,
    removeEvolution,
    getNumLevels,
    getEvolutionLearning,
    getEvolutionAction,
    uploadIEvolution,
    uploadPEvolution,
    uploadTEvolution,
    loadEvolution
};