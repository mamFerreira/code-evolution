'use strict'

var fs = require('fs');
var path = require('path');
var mongo = require('mongodb');
var ObjectID = require('mongodb').ObjectID;
var Evolution = require ('../models/evolution');
var Level = require ('../models/level');
var GLOBAL = require ('../services/global');


/**
 * Registrar nueva evolución en BBDD
 * @returns evolution: Evolución creada
 */
function addEvolution (req, res){
    var evolution = new Evolution();
    var params = req.body; //Recogemos los datos que llegan por POST

    evolution.order = params.order;
    evolution.origin = params.origin;
    evolution.name = params.name;
    evolution.description = params.description;    
    evolution.health = params.health;


    if (evolution.order && evolution.name && params.health){
        Evolution.findOne({order:evolution.order},(err, evolution_db) => {
            if(err){                
                res.status(500).send({message:'Error en el servidor', messageError:err.message});  
            }else{
                if (evolution_db){
                    res.status(200).send({message:'Error: Existe otra evolución con el mismo orden ' + evolution.order});
                }else{
                    evolution.save((err,evolutionAdd) => {
                        if(err){
                            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                        }else{
                            if(!evolutionAdd){
                                res.status(404).send({message:'Error: La evolución no ha sido creada'});
                            }else{
                                res.status(200).send({evolution: evolutionAdd});
                            }
                        }
                    });
                }
            }
        });
    }else{
        res.status(200).send({message:'Error: Los campos orden, nombre y salud son obligatorios'});
    }
}

/**
 * Obtener evoluciones registradas
 * @param id: Identificador de la evolucion deseada (opcional)
 * @param order: Orden de la evolución deseada (opcional)
 * @returns evolutions: Evoluciones solicitadas
 */
function getEvolutions (req, res){
    var query = {}

    if (req.params.id){
        var o_id = new mongo.ObjectID(req.params.id);
        query = { '_id' : o_id };
    }   
    
    if (req.params.order){        
        query = { 'order' : req.params.order };
    } 

    Evolution.find(query).sort({order:1}).exec((err,evolutions) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{
            if (!evolutions){
                res.status(200).send({message: 'Ninguna acción registrada en el sistema'});
            }else{
                res.status(200).send({evolutions});                
            }
        }
    });
}


/**
 * Actualizar evolución
 * @param id: Identificador de la evolución a actualizar
 * @returns evolution: Evolución antes de actualizar
 */
function updateEvolution (req, res){
    var id = req.params.id;
    var update = req.body;     

    if (update.order && update.name && update.health) {
        Evolution.findByIdAndUpdate(id,update,(err,evolution) => {
            if (err){
                res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
            }else{
                if(!evolution){
                    res.status(404).send({message: 'Error: la evolución no ha podido ser actualizada'});
                }else{
                    res.status(200).send({evolution});
                }
            }
        });
    }else{
        res.status(200).send({message:'Error: Los campos orden, nombre y salud son obligatorios'});
    }    
}


/**
 * Eliminar evolución
 * @param id: Identificador de la evolución a eliminar
 * @param evolution: Evolución elimada
 */
function removeEvolution (req, res){
    var id = req.params.id;

    Level.findOne({evolutionID: id},(err, level_db) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{
            if (level_db){
                res.status(200).send({message: 'Error al eliminar evolución: debe eliminar antes sus niveles asociados'});
            } else {
                Evolution.findByIdAndRemove(id,(err,evolution) => {
                    if (err){
                        res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
                    }else{
                        if(!evolution){
                            res.status(404).send({message: 'Error: No ha podido eliminarse la evolución'}); 
                        }else{             
                            let file = GLOBAL.PATH_FILE_EVOLUTION + evolution.image;
                            fs.exists(file, (exists) => {
                                if(exists){
                                    fs.unlink(file)
                                }
                            });                 
                            res.status(200).send({evolution});
                        }
                    }
                });
            }                     
        }
    });
}


/**
 * Subir imágen de la evolución a partir de su id
 * @returns image: Nombre de la imagen. 
 *          evolution: Evolución antes de la actualización.
 */
function uploadEvolution (req,res){
    var id = req.params.id;
    var file_name = 'No subido...';    

    if (req.files.image){
        var file_path = req.files.image.path;        
        var file_name = file_path.split('\/')[2];
        var ext = file_name.split('\.')[1];        
        var field = {image: file_name};                   
        if (ext=='png'){
            Evolution.findByIdAndUpdate(id, field, (err,evolution) => {
                if (err){
                    res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
                }else{
                    if(!evolution){
                        res.status(404).send({message: 'Error: No ha podido actualizarse el registro'}); 
                    }else{
                        // Eliminamos la imagen anterior
                        let file_old = GLOBAL.PATH_FILE_EVOLUTION + evolution.image;
                        fs.exists(file_old, (exists) => {
                            if(exists){
                                fs.unlink(file_old)
                            }
                        });                                              
                        res.status(200).send({image:file_name, evolution});
                    }
                }
            });            
        }else{
            fs.unlink(file_path, (err) => {
                var msg = '';
                if (err){
                    msg = err.message;
                }
                res.status(200).send({message:'Extensión del archivo no válida (.png)', messageError: msg});
            });            
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

    var id = req.params.id;        

    Evolution.findById(id).exec((err,evolution)=>{            
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{
            if(!evolution){
                res.status(200).send({message: 'No existe la evolución indicada'}); 
            }else{                               
                var path_file = GLOBAL.PATH_FILE_EVOLUTION + evolution.image;                    
                fs.exists(path_file, (exists) => {
                    if(exists){
                        res.sendFile(path.resolve(path_file));
                    }else{
                        res.status(200).send({message:'La imagen no existe'}); 
                    }
                });                  
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
            {'evolutionID': parama_id}
        },
        {$lookup:
            {
                from: GLOBAL.TABLE_LEVEL_ACTION,
                localField: '_id',
                foreignField: 'levelID',
                as: 'tmp'
            }
        },
        {
            $unwind: "$tmp"
        },
        {
            $lookup:{
                from: GLOBAL.TABLE_ACTION,
                localField: "tmp.actionID",
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
               
    ]).exec ((err,actions) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{
            if(!actions || actions.length == 0){
                res.status(200).send({message: 'Ninguna acción asociada a la evolución'});
            }else{
                var list = actions[0].uniqueValues;
                var json = [];                                

                list.forEach(element => {
                    json.push(element[0]);
                });
                res.status(200).send({actions: json});                
            }
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
            {'evolutionID': parama_id}
        },
        {$lookup:
            {
                from: GLOBAL.TABLE_LEVEL_LEARNING,
                localField: '_id',
                foreignField: 'levelID',
                as: 'tmp'
            }
        },
        {
            $unwind: "$tmp"
        },
        {
            $lookup:{
                from: GLOBAL.TABLE_LEARNING,
                localField: "tmp.learningID",
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
        },
    ]).exec ((err,learnings) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{            
            if(!learnings || learnings.length == 0){
                res.status(200).send({message: 'Ningún aprendizaje asociado a la evolución'});
            }else{                
                var list = learnings[0].uniqueValues;
                var json = [];                                

                list.forEach(element => {
                    json.push(element[0]);
                });
                res.status(200).send({learnings: json});                             
            }
        } 
    });
    
}






module.exports = {
    addEvolution,
    getEvolutions,
    updateEvolution,
    removeEvolution,
    uploadEvolution,
    loadEvolution,
    getEvolutionAction,
    getEvolutionLearning
};