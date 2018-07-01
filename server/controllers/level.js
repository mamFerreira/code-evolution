'use strict'

var fs = require('fs');
var path = require('path');
var mongo = require('mongodb');
var GLOBAL = require ('../services/global');
var Level = require ('../models/level');
var LevelGoal = require('../models/level_goal');
var LevelLearning = require('../models/level_learning');
var LevelAction = require('../models/level_action');
var Game = require('../models/game');



/**
 * OPERACIONES CRUD
 */

/**
 * Añadir nuevo nivel
 * @returns level: Nivel añadido en BBDD
 */
function addLevel (req, res){
    var level = new Level();
    var params = req.body; //Recogemos los datos que llegan por POST

    level.order = params.order;
    level.name = params.name;        
    level.description = params.description;
    level.state = params.state;
    level.time = params.time;
    level.evolutionID = params.evolutionID;
    
    if (level.order && level.name && level.state && level.time && level.evolutionID){
        //Comprobamos si existe nivel con mismo orden
        Level.findOne({order:level.order},(err,level_db) => {
            if(err){                
                res.status(500).send({message:'Error en el servidor', messageError:err.message});  
            }else{
                if (level_db){
                    res.status(200).send({message:'Error: Existe otro nivel con el mismo orden ' + level.order});
                }else{
                    level.save((err,levelAdd) => {
                        if(err){
                            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                        }else{
                            if(!levelAdd){
                                res.status(404).send({message:'Error: El nivel no ha sido creado'});
                            }else{
                                res.status(200).send({level: levelAdd});
                            }
                        }
                    });
                }
            }
        });        
    }else{
        res.status(200).send({message:'Error: Los campos orden, nombre, estado, tiempo y evolución son obligatorios'});
    }
}

/**
 * Obtener niveles registradas
 * @param id: Identificador del nivel deseado (opcional)
 * @param order: Orden del nivel deseado (opcional)
 * @param evolutionID: Evolución de los niveles deseados (opcional)
 * @returns levels: Niveles solicitados
 */
function getLevels (req, res){
    var query = {}

    if (req.params.id){
        var o_id = new mongo.ObjectID(req.params.id);
        query = { '_id' : o_id };
    }   
    
    if (req.params.order && req.params.evolutionID){        
        query = { 'order' : req.params.order, 'evolutionID' : req.params.evolutionID };
    } 

    if (!req.params.order && req.params.evolutionID){        
        query = { 'evolutionID' : req.params.evolutionID };
    } 

    Level.find(query).sort({evolutionID:1,order:1}).exec((err,levels) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{
            if (!levels){
                res.status(200).send({message: 'Ningún nivel registrado en el sistema'});
            }else{
                res.status(200).send({levels});                
            }
        }
    });
}

/**
 * Actualizar nivel
 * @param id: Identificador del nivel a actualizar
 * @returns level: Nivel antes de actualizar
 */
function updateLevel (req, res){
    var id = req.params.id;
    var update = req.body;     

    if (update.order && update.name && update.state && update.time && update.evolutionID) {
        Level.findByIdAndUpdate(id,update,(err,level) => {
            if (err){
                res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
            }else{
                if(!level){
                    res.status(404).send({message: 'Error: el nivel no ha podido ser actualizado'});
                }else{
                    res.status(200).send({level});
                }
            }
        });
    }else{
        res.status(200).send({message:'Error: Los campos orden, nombre, estado y tiempo son obligatorios'});
    }    
}

/**
 * Eliminar nivel
 * @param id: Identificador del nivel a eliminar
 * @param level: Nivel eliminado
 */
function removeLevel (req, res){
    var id = req.params.id;

    Level.findByIdAndRemove(id,(err,level) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{
            if(!level){
                res.status(404).send({message: 'Error: No ha podido eliminarse el nivel'}); 
            }else{             
                let file = GLOBAL.PATH_FILE_LEVEL + level.image;
                fs.exists(file, (exists) => {
                    if(exists){
                        fs.unlink(file)
                    }
                });                 

                LevelAction.remove({levelID:id}).exec();
                LevelGoal.remove({levelID:id}).exec();
                LevelLearning.remove({levelID:id}).exec();
                Game.remove({levelID:id}).exec();

                res.status(200).send({level});
            }
        }
    });
}


/**
 * Subir imágen del nivel a partir de su id
 * @returns image: Nombre de la imagen. 
 *          level: Nivel antes de la actualización.
 */
function uploadLevel (req,res){
    var id = req.params.id;
    var file_name = 'No subido...';    

    if (req.files.image){
        var file_path = req.files.image.path;        
        var file_name = file_path.split('\/')[2];
        var ext = file_name.split('\.')[1];        
        var field = {image: file_name};                   
        if (ext=='png'){
            Level.findByIdAndUpdate(id, field, (err,level) => {
                if (err){
                    res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
                }else{
                    if(!level){
                        res.status(404).send({message: 'Error: No ha podido actualizarse el registro'}); 
                    }else{
                        // Eliminamos la imagen anterior
                        let file_old = GLOBAL.PATH_FILE_LEVEL + level.image;
                        fs.exists(file_old, (exists) => {
                            if(exists){
                                fs.unlink(file_old)
                            }
                        });                                              
                        res.status(200).send({image:file_name, level});
                    }
                }
            });            
        }else{
            fs.unlink(file_path, (err) => {
                var msg = '';
                if (err){
                    msg = err.message;
                }
                res.status(200).send({message:'Extensión del archivo no válida (.png)', messageError:err.message});
            });            
        }        
    }else{
        res.status(200).send({message:'Imagen no subida'});
    }
}


/**
 * Cargar imagen de nivel
 * @return imagen de nivel
 */
function loadLevel (req,res){

    var id = req.params.id;        

    Level.findById(id).exec((err,level)=>{            
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{
            if(!level){
                res.status(200).send({message: 'No existe el nivel indicado'}); 
            }else{                               
                var path_file = GLOBAL.PATH_FILE_LEVEL + level.image;                    
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
 * Asociar nueva acción al nivel. Si ya existe la asociación no hago nada.
 * @returns level_action: Relación nivel-acción añadida 
 */
function addAction (req, res) {
    var level_action = new LevelAction();    
    var params = req.body; 

    level_action.levelID = params.levelID;
    level_action.actionID = params.actionID;        

    if (level_action.levelID && level_action.actionID){
        LevelAction.find({levelID:level_action.levelID, actionID: level_action.actionID}).exec( (err,level_action_db) => {
            if (err){
                res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
            }else{                
                if (level_action_db.length>0){                    
                    res.status(200).send({message:'Error: Acción ya asociada al nivel'});
                }else{
                    level_action.save((err,level_action) => {
                        if(err){
                            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                        }else{
                            if(!level_action){
                                res.status(404).send({message:'Error: La acción no ha sido asociada al nivel'});
                            }else{
                                res.status(200).send({level_action});
                            }
                        }
                    });
                }
            }
        });
    }else{
        res.status(200).send({message:'Error: Los campos levelID y actionID son obligatorios'});
    }
}


/**
 * Obtener acciones asociadas
 * @param levelID: Identificador del nivel deseado
 * @returns actions: Acciones solicitadas
 */
function getActions (req, res){

    var levelID = req.params.levelID;

    LevelAction.find({'levelID': levelID}).populate({path:'actionID'}).exec((err,actions) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{            
            if (!actions){
                res.status(200).send({message: 'Ninguna acción asociada al nivel'})
            }else{
                res.status(200).send({actions});
            }
        }
    });
}


/**
 * Eliminar acción del nivel
 * @param id: Identificador de la relación acción nivel
 * @returns level_action: Relación nivel-acción eliminada
 */
function removeAction (req, res){    
    var query = {levelID: req.params.idLevel, actionID: req.params.idAction}
    LevelAction.findOneAndRemove(query,(err,level_action) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{
            if(!level_action){
                res.status(404).send({message: 'Error: No ha podido eliminarse el registro'}); 
            }else{                
                res.status(200).send({level_action});
            }
        }
    });
}


/**
 * Asociar nuevo aprendizaje al nivel. Si ya existe la asociación no hago nada.
 * @returns level_learning: Relación nivel-aprendizaje añadida 
 */
function addLearning (req, res) {
    var level_learning = new LevelLearning();    
    var params = req.body; 

    level_learning.levelID = params.levelID;
    level_learning.learningID = params.learningID;        

    if (level_learning.levelID && level_learning.learningID){
        LevelLearning.find({levelID:level_learning.levelID, learningID: level_learning.learningID}).exec( (err,level_learning_db) => {
            if (err){
                res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
            }else{                
                if (level_learning_db.length>0){
                    res.status(200).send({message:'Error: Aprendizaje ya asociado al nivel'});
                }else{
                    level_learning.save((err,level_learning) => {
                        if(err){
                            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                        }else{
                            if(!level_learning){
                                res.status(404).send({message:'Error: El aprendizaje no ha sido asociada al nivel'});
                            }else{
                                res.status(200).send({level_learning});
                            }
                        }
                    });
                }
            }
        });
    }else{
        res.status(200).send({message:'Error: Los campos levelID y learningID son obligatorios'});
    }
}


/**
 * Obtener aprendizaje asociada
 * @param levelID: Identificador del nivel deseado
 * @returns learnings: Aprendizaje solicitado
 */
function getLearnings (req, res){

    var levelID = req.params.levelID;

    LevelLearning.find({'levelID': levelID}).populate({path:'learningID'}).exec((err,learnings) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{
            if (!learnings){
                res.status(200).send({message: 'Ningún aprendizaje asociado al nivel'})
            }else{
                res.status(200).send({learnings});
            }
        }
    });
}


/**
 * Eliminar aprendizaje del nivel
 * @param id: Identificador de la relación aprendizaje nivel
 * @returns level_learning: Relación nivel-aprendizaje eliminada
 */
function removeLearning (req, res){
    var query = {levelID: req.params.idLevel, learningID: req.params.idLearning}
    LevelLearning.findOneAndRemove(query,(err,level_learning) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{
            if(!level_learning){
                res.status(404).send({message: 'Error: No ha podido eliminarse el registro'}); 
            }else{                
                res.status(200).send({level_learning});
            }
        }
    });
}


/**
 * Asociar nuevo objetivo al nivel. Si ya existe actualiza sus valores.
 * @returns level-goal: Relación nivel-aprendizaje añadida 
 */
function addGoal (req, res) {
    var level_goal = new LevelGoal();    
    var params = req.body; 

    level_goal.levelID = params.levelID;
    level_goal.goalID = params.goalID;        
    level_goal.value_1 = params.value_1;     
    level_goal.value_2 = params.value_2;     

    if (level_goal.levelID && level_goal.goalID){
        LevelGoal.find({levelID:level_goal.levelID, goalID: level_goal.goalID}).exec( (err,level_goal_db) => {
            if (err){
                res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
            }else{                            
                if (level_goal_db.length>0){

                    var id = level_goal_db[0]._id;
                    level_goal._id = id;

                    LevelGoal.findByIdAndUpdate(id,level_goal,(err,level_goal) => {
                        if (err){
                            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
                        }else{
                            if(!level_goal){
                                res.status(404).send({message: 'Error: la relación objetivo-nivel no ha podido ser actualizada'});
                            }else{
                                res.status(200).send({level_goal});
                            }
                        }
                    });
                }else{
                    level_goal.save((err,level_goal) => {
                        if(err){
                            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                        }else{
                            if(!level_goal){
                                res.status(404).send({message:'Error: El objetivo no ha sido asociada al nivel'});
                            }else{
                                res.status(200).send({level_goal});
                            }
                        }
                    });
                }
            }
        });
    }else{
        res.status(200).send({message:'Error: Los campos levelID y goalID son obligatorios'});
    }
}


/**
 * Obtener objetivos asociados
 * @param levelID: Identificador del nivel deseado
 * @returns goals: Objetivos solicitados
 */
function getGoals (req, res){

    var levelID = req.params.levelID;

    LevelGoal.find({'levelID': levelID}).exec((err,goals) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{
            if (!goals){
                res.status(200).send({message: 'Ningún objetivo asociado al nivel'})
            }else{
                res.status(200).send({goals});
            }
        }
    });
}


/**
 * Eliminar objetivo del nivel
 * @param idLevel: Identificador del nivel
 * @param idGoal: Identificador del objetivo
 * @returns level_goal: Relación nivel-objetivo eliminada
 */
function removeGoal (req, res){        
    var query = {levelID: req.params.idLevel, goalID: req.params.idGoal}        
    LevelGoal.findOneAndRemove(query,(err,level_goal) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{            
            if(!level_goal){
                res.status(404).send({message: 'Error: No ha podido eliminarse el registro'}); 
            }else{                
                res.status(200).send({level_goal});
            }
        }
    });
}



module.exports = {
    addLevel,
    getLevels,
    updateLevel,
    removeLevel,
    uploadLevel,
    loadLevel,
    addAction,
    getActions,
    removeAction,
    addLearning,
    getLearnings,
    removeLearning,
    addGoal,
    getGoals,
    removeGoal
};