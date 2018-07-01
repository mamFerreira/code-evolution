'use strict'

var mongo = require('mongodb');
var Goal = require ('../models/goal');
var LevelGoal = require ('../models/level_goal')

/**
 * Registrar nuevo objetivo en BBDD
 * @returns goal: Objetivo creado
 */
function addGoal (req, res){
    var goal = new Goal();
    var params = req.body; //Recogemos los datos que llegan por POST        
    
    goal.key = params.key;
    goal.name = params.name;        
    
    if (goal.key && goal.name){
        //Comprobamos si existe objetivo con la misma clave
        Goal.findOne({key:goal.key},(err,goal_db) => {
            if(err){                
                res.status(500).send({message:'Error en el servidor', messageError:err.message});  
            }else{
                if (goal_db){
                    res.status(200).send({message:'Error: Existe otro objetivo con la misma clave ' + goal.key});
                }else{
                    goal.save((err,goalAdd) => {
                        if(err){
                            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                        }else{
                            if(!goalAdd){
                                res.status(404).send({message:'Error: El objetivo no ha sido creado'});
                            }else{
                                res.status(200).send({goal: goalAdd});
                            }
                        }
                    });
                }
            }
        });        
    }else{
        res.status(200).send({message:'Error: Los campos clave y nombre son obligatorios'});
    }
}

/**
 * Obtener objetivos registrados
 * @param id: Identificador del objetivo deseado (opcional)
 * @returns goals: Objetivos solicitados
 */
function getGoals (req, res){
    var query = {}

    if (req.params.id){
        var o_id = new mongo.ObjectID(req.params.id);
        query = { '_id' : o_id };
    }    

    Goal.find(query).exec((err,goals) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{
            if (!goals){
                res.status(200).send({message: 'Ninguna objetivo registrado en el sistema'});
            }else{
                res.status(200).send({goals});                
            }
        }
    });
}

/**
 * Actualizar objetivo
 * @param id: Identificador del objetivo a actualizar
 * @returns goal: Objetivo antes de actualizar
 */
function updateGoal (req, res){
    var id = req.params.id;
    var update = req.body;     

    if (update.key && update.name) {
        Goal.findByIdAndUpdate(id,update,(err,goal) => {
            if (!err){
                res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
            }else{
                if(!goal){
                    res.status(404).send({message: 'Error: el objetivo no ha podido ser actualizado'});
                }else{
                    res.status(200).send({goal});
                }
            }
        });
    }else{
        res.status(200).send({message:'Error: Los campos clave y nombre son obligatorios'});
    } 
}

/**
 * Eliminar objetivo
 * @param id: Identificador del objetivo a eliminar
 * @param goal: Objetivo elimado
 */
function removeGoal (req, res){
    var id = req.params.id;

    Goal.findByIdAndRemove(id,(err,goal) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{
            if(!goal){
                res.status(404).send({message: 'Error: No ha podido eliminarse el objetivo'}); 
            }else{
                LevelGoal.remove({goalID:id});
                res.status(200).send({goal});
            }
        }
    });
}

module.exports = {
    addGoal,
    getGoals,
    updateGoal,
    removeGoal
};