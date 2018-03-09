'use strict'

var Learning = require ('../models/learning');
var LevelLearning = require ('../models/level_learning')
var table = 'learning';

/**
 * Registrar nuevo aprendizaje en BBDD
 * @returns learning: Aprendizaje creado
 */
function addLearning (req, res){
    var tuple = new Learning();
    var params = req.body; //Recogemos los datos que llegan por POST

    tuple.title = params.title;
    tuple.description = params.description;
    tuple.example = params.example;
    
    if (tuple.title && tuple.description){
        tuple.save((err,tupleAdd) => {
            if(err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                if(!tupleAdd){
                    res.status(404).send({message:'Tupla no registrada: ' + table});
                }else{
                    res.status(200).send({learning: tupleAdd});
                }
            }
        });
    }else{
        res.status(200).send({message:'rellene los campos obligatorios'});
    }
}

/**
 * Obtener aprendizaje
 * @param id: Identificador del aprendizaje deseado
 * @returns learning: Aprendizaje solicitado
 */
function getLearning (req,res){
    var id = req.params.id;

    Learning.findById(id).exec((err,tuple)=>{
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(!tuple){
                res.status(404).send({message: 'No existe tupla con dicho identificador: ' + table}); 
            }else{                
                res.status(200).send({learning: tuple});              
            }
        }
    });
}

/**
 * Obtener todos los aprendizajes o los asociados al nivel pasado por parámetro
 * @param level: Identificador del nivel (opcional)
 * @returns learnings: Aprendizaje solicitados
 */
function getLearnings (req, res){
    var level = req.params.level;

    if (level){        
        LevelLearning.find({'level': level}).populate({path:'learning'}).exec((err,tuples) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});    
            }else{
                if (tuples.length==0){
                    res.status(200).send({message: 'Ningún aprendizaje asociado al nivel'})
                }else{
                    res.status(200).send({learnings: tuples});
                }
            }
        });
    }else{
        Learning.find({}).exec((err,tuples) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});    
            }else{
                if (tuples.length==0){
                    res.status(404).send({message: 'Ningún aprendizaje registrado'});
                }else{
                    res.status(200).send({learnings: tuples});
                }
            }
        });
    }
}

/**
 * Actualizar aprendizaje
 * @param id: Identificador del aprendizaje a actualizar
 * @returns learning: Aprendizaje antes de actualizar
 */
function updateLearning (req, res){
    var id = req.params.id;
    var update = req.body;     
    
    if (update.title.length > 0 && update.description.length > 0) {
        Learning.findByIdAndUpdate(id,update,(err,tupleUpdate) => {
            if (err){
                res.status(500).send({message:'Error al actualizar: ' + table, messageError: err.message}); 
            }else{
                if(!tupleUpdate){
                    res.status(404).send({message: 'Error al actualizar: ' + table});
                }else{
                    res.status(200).send({learning:tupleUpdate});
                }
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios: nombre, descripción, ejemplo'});
    }
}

/**
 * Eliminar aprendizaje
 * @param id: Identificador del aprendizaje a eliminar
 * @param learning: Aprendizaje elimado
 */
function removeLearning (req, res){
    var id = req.params.id;

    Learning.findByIdAndRemove(id,(err,tupleRemove) => {
        if (err){
            res.status(500).send({message:'Error al eliminar: ' + table, messageError: err.message}); 
        }else{
            if(!tupleRemove){
                res.status(404).send({message: 'Error al eliminar: ' + table});
            }else{
                LevelLearning.remove({learning: tupleRemove._id}).exec();
                res.status(200).send({learning:tupleRemove});
            }
        }
    });
}

module.exports = {
    addLearning,
    getLearning,
    getLearnings,
    updateLearning,
    removeLearning
};