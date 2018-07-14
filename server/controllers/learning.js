'use strict'

var mongo = require('mongodb');
var Learning = require ('../models/learning');
var LevelLearning = require ('../models/level_learning')

/**
 * Registrar nuevo aprendizaje en BBDD
 * @returns learning: Aprendizaje creado
 */
function addLearning (req, res){
    var learning = new Learning();
    var params = req.body; //Recogemos los datos que llegan por POST

    learning.order = params.order;
    learning.name = params.name;
    learning.shortName = params.shortName;
    learning.description = params.description;
    learning.example = params.example;
        
    if (learning.order && learning.name && learning.shortName){
        //Comprobamos si existe aprendizaje con mismo orden
        Learning.findOne({order:learning.order},(err,learning_db) => {
            if(err){                
                res.status(500).send({message:'Error en el servidor', messageError:err.message});  
            }else{
                if (learning_db){
                    res.status(200).send({message:'Error: Existe otro aprendizaje con el mismo orden ' + learning.order});
                }else{
                    learning.save((err,learningAdd) => {
                        if(err){
                            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                        }else{
                            if(!learningAdd){
                                res.status(404).send({message:'Error: El aprendizaje no ha sido creado'});
                            }else{
                                res.status(200).send({learning: learningAdd});
                            }
                        }
                    });
                }
            }
        });        
    }else{
        res.status(200).send({message:'Error: Los campos orden, nombre y nombre corto son obligatorios'});
    }
}

/**
 * Obtener aprendizaje registrado
 * @param id: Identificador de la acción deseada (opcional)
 * @returns learnings: Aprendizaje solicitados
 */
function getLearnings (req, res){
    var query = {}

    if (req.params.id){
        var o_id = new mongo.ObjectID(req.params.id);
        query = { '_id' : o_id };
    }    

    Learning.find(query).sort({order:1}).exec((err,learnings) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{
            if (!learnings){
                res.status(200).send({message: 'Ningún aprendizaje registrado en el sistema'});
            }else{
                res.status(200).send({learnings});                
            }
        }
    });
}

/**
 * Actualizar aprendizaje
 * @param id: Identificador del aprendizaje a actualizar
 * @returns learning: Aprendizaje antes de actualizar
 */
function updateLearning (req, res){
    var id = req.params.id;
    var update = req.body;     

    if (update.order && update.name && update.shortName) {
        Learning.findByIdAndUpdate(id,update,(err,learning) => {
            if (err){
                res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
            }else{
                if(!learning){
                    res.status(404).send({message: 'Error: el aprendizaje no ha podido ser actualizado'});
                }else{
                    res.status(200).send({learning});
                }
            }
        });
    }else{
        res.status(200).send({message:'Error: Los campos orden, nombre y nombre corto son obligatorios'});
    }  
}

/**
 * Eliminar aprendizaje
 * @param id: Identificador del aprendizaje a eliminar
 * @param learning: Aprendizaje elimado
 */
function removeLearning (req, res){
    var id = req.params.id;

    Learning.findByIdAndRemove(id,(err,learning) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{
            if(!learning){
                res.status(404).send({message: 'Error: No ha podido eliminarse el registro'}); 
            }else{
                LevelLearning.remove({learningID:id});
                res.status(200).send({learning});
            }
        }
    });
}

module.exports = {
    addLearning,    
    getLearnings,
    updateLearning,
    removeLearning
};