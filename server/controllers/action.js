'use strict'

var mongo = require('mongodb');
var Action = require ('../models/action');
var LevelAction = require ('../models/level_action')

/**
 * Registrar nueva acción en BBDD
 * @returns action: Acción creada
 */
function addAction (req, res){
    var action = new Action();
    var params = req.body; //Recogemos los datos que llegan por POST

    action.order = params.order;
    action.name = params.name;    
    action.shortName = params.shortName;
    action.description = params.description;
    action.example = params.example;        

    if (action.order && action.name && action.shortName){
        //Comprobamos si existe accion con mismo orden
        Action.findOne({order:action.order},(err,action_db) => {
            if(err){                
                res.status(500).send({message:'Error en el servidor', messageError:err.message});  
            }else{
                if (action_db){
                    res.status(200).send({message:'Error: Existe otra acción con el mismo orden ' + action.order});
                }else{
                    action.save((err,actionAdd) => {
                        if(err){
                            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                        }else{
                            if(!actionAdd){
                                res.status(404).send({message:'Error: La acción no ha sido creada'});
                            }else{
                                res.status(200).send({action: actionAdd});
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
 * Obtener acciones registradas
 * @param id: Identificador de la acción deseada (opcional)
 * @returns actions: Acciones solicitadas
 */
function getActions (req, res){
    var query = {}

    if (req.params.id){
        var o_id = new mongo.ObjectID(req.params.id);
        query = { '_id' : o_id };
    }    

    Action.find(query).sort({order:1}).exec((err,actions) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{
            if (!actions){
                res.status(200).send({message: 'Ninguna acción registrada en el sistema'});
            }else{
                res.status(200).send({actions});                
            }
        }
    });
}

/**
 * Actualizar acción
 * @param id: Identificador de la acción a actualizar
 * @returns action: Acción antes de actualizar
 */
function updateAction (req, res){
    var id = req.params.id;
    var update = req.body;     

    if (update.order && update.name && update.shortName) {
        Action.findByIdAndUpdate(id,update,(err,action) => {
            if (err){
                res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
            }else{
                if(!action){
                    res.status(404).send({message: 'Error: la acción no ha podido ser actualizada'});
                }else{
                    res.status(200).send({action});
                }
            }
        });
    }else{
        res.status(200).send({message:'Error: Los campos orden, nombre y nombre corto son obligatorios'});
    }    
}

/**
 * Eliminar acción
 * @param id: Identificador de la acción a eliminar
 * @param action: Acción elimada
 */
function removeAction (req, res){
    var id = req.params.id;

    Action.findByIdAndRemove(id,(err,action) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{
            if(!action){
                res.status(404).send({message: 'Error: No ha podido eliminarse el registro'}); 
            }else{
                LevelAction.remove({actionID:id});
                res.status(200).send({action});
            }
        }
    });
}

module.exports = {
    addAction,    
    getActions,
    updateAction,
    removeAction
};