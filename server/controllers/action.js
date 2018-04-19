'use strict'

var Action = require ('../models/action');
var LevelAction = require ('../models/level_action')
var table = 'action';

/**
 * Registrar nueva acción en BBDD
 * @returns action: Acción creada
 */
function addAction (req, res){
    var tuple = new Action();
    var params = req.body; //Recogemos los datos que llegan por POST

    tuple.method = params.method;
    tuple.key = params.key;
    tuple.description = params.description;
    tuple.example = params.example;
    
    if (tuple.method && tuple.key && tuple.description && tuple.example){
        tuple.save((err,tupleAdd) => {
            if(err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                if(!tupleAdd){
                    res.status(404).send({message:'Tupla no registrada: ' + table});
                }else{
                    res.status(200).send({action: tupleAdd});
                }
            }
        });
    }else{
        res.status(200).send({message:'rellene los campos obligatorios'});
    }
}

/**
 * Obtener acción
 * @param id: Identificador de la acción deseada
 * @returns action: Acción solicitada
 */
function getAction (req,res){
    var id = req.params.id;

    Action.findById(id).exec((err,tuple)=>{
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(!tuple){
                res.status(404).send({message: 'No existe tupla con dicho identificador: ' + table}); 
            }else{                
                res.status(200).send({action: tuple});              
            }
        }
    });
}

/**
 * Obtener todas las acciooes o las asociadas al nivel pasado por parámetro
 * @param level: Identificador del nivel (opcional)
 * @returns actions: Acciones solicitadas
 */
function getActions (req, res){
    var level = req.params.level;

    if (level){        
        LevelAction.find({'level': level}).populate({path:'action'}).exec((err,tuples) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});    
            }else{
                if (tuples.length==0){
                    res.status(200).send({message: 'Ninguna acción asociada al nivel'})
                }else{
                    res.status(200).send({actions: tuples});
                }
            }
        });
    }else{
        Action.find({}).exec((err,tuples) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});    
            }else{
                if (tuples.length==0){
                    res.status(404).send({message: 'Ninguna acción registrada'});
                }else{
                    res.status(200).send({actions: tuples});
                }
            }
        });
    }
}

/**
 * Actualizar acción
 * @param id: Identificador de la acción a actualizar
 * @returns action: Acción antes de actualizar
 */
function updateAction (req, res){
    var id = req.params.id;
    var update = req.body;     

    if (update.method.length > 0 && update.key.length > 0 && update.description.length > 0 && update.example.length > 0) {
        Action.findByIdAndUpdate(id,update,(err,tupleUpdate) => {
            if (err){
                res.status(500).send({message:'Error al actualizar: ' + table, messageError: err.message}); 
            }else{
                if(!tupleUpdate){
                    res.status(404).send({message: 'Error al actualizar: ' + table});
                }else{
                    res.status(200).send({action:tupleUpdate});
                }
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios: método, descripción, ejemplo'});
    }    
}

/**
 * Eliminar acción
 * @param id: Identificador de la acción a eliminar
 * @param action: Acción elimada
 */
function removeAction (req, res){
    var id = req.params.id;

    Action.findByIdAndRemove(id,(err,tupleRemove) => {
        if (err){
            res.status(500).send({message:'Error al eliminar: ' + table, messageError: err.message}); 
        }else{
            if(!tupleRemove){
                res.status(404).send({message: 'Error al eliminar: ' + table});
            }else{
                LevelAction.remove({action: tupleRemove._id}).exec();
                res.status(200).send({action:tupleRemove});
            }
        }
    });
}

module.exports = {
    addAction,
    getAction,
    getActions,
    updateAction,
    removeAction
};