'use strict'

var Goal = require ('../models/goal');
var LevelGoal = require ('../models/level_goal')
var table = 'goal';

/**
 * Registrar nuevo objetivo en BBDD
 * @returns goal: Objetivo creado
 */
function addGoal (req, res){
    var tuple = new Goal();
    var params = req.body; //Recogemos los datos que llegan por POST

    tuple.title = params.title;
    
    if (tuple.title){
        tuple.save((err,tupleAdd) => {
            if(err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                if(!tupleAdd){
                    res.status(404).send({message:'Tupla no registrada: ' + table});
                }else{
                    res.status(200).send({goal: tupleAdd});
                }
            }
        });
    }else{
        res.status(200).send({message:'rellene los campos obligatorios'});
    }
}

/**
 * Obtener objetivo
 * @param id: Identificador del objetivo deseado
 * @returns goal: Objetivo solicitado
 */
function getGoal (req,res){
    var id = req.params.id;

    Goal.findById(id).exec((err,tuple)=>{
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(!tuple){
                res.status(404).send({message: 'No existe tupla con dicho identificador: ' + table}); 
            }else{                
                res.status(200).send({goal: tuple});              
            }
        }
    });
}

/**
 * Obtener todos los objetivos o los asociados al nivel pasado por parámetro
 * @param level: Identificador del nivel (opcional)
 * @returns goals: Objetivos solicitados
 */
function getGoals (req, res){
    var level = req.params.level;

    if (level){        
        LevelGoal.find({'level': level}).populate({path:'goal'}).exec((err,tuples) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});    
            }else{
                if (tuples.length==0){
                    res.status(200).send({message: 'Ningún objetivo asociado al nivel'})
                }else{
                    res.status(200).send({goals: tuples});
                }
            }
        });
    }else{
        Goal.find({}).exec((err,tuples) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});    
            }else{
                if (tuples.length==0){
                    res.status(200).send({message: 'Ningún objetivo registrado'});
                }else{
                    res.status(200).send({goals: tuples});
                }
            }
        });
    }
}

/**
 * Actualizar objetivo
 * @param id: Identificador del objetivo a actualizar
 * @returns goal: Objetivo antes de actualizar
 */
function updateGoal (req, res){
    var id = req.params.id;
    var update = req.body;     

    if (update.title.length > 0) {
        Goal.findByIdAndUpdate(id,update,(err,tupleUpdate) => {
            if (err){
                res.status(500).send({message:'Error al actualizar: ' + table, messageError: err.message}); 
            }else{
                if(!tupleUpdate){
                    res.status(404).send({message: 'Error al actualizar: ' + table});
                }else{
                    res.status(200).send({goal:tupleUpdate});
                }
            }
        })
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios: nombre'});
    }
}

/**
 * Eliminar objetivo
 * @param id: Identificador del objetivo a eliminar
 * @param goal: Objetivo elimado
 */
function removeGoal (req, res){
    var id = req.params.id;

    Goal.findByIdAndRemove(id,(err,tupleRemove) => {
        if (err){
            res.status(500).send({message:'Error al eliminar: ' + table, messageError: err.message}); 
        }else{
            if(!tupleRemove){
                res.status(404).send({message: 'Error al eliminar: ' + table});
            }else{
                LevelGoal.remove({goal: tupleRemove._id}).exec();
                res.status(200).send({goal:tupleRemove});                
            }
        }
    });
}

module.exports = {
    addGoal,
    getGoal,
    getGoals,
    updateGoal,
    removeGoal
};