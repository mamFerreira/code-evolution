'use strict'

var fs = require('fs');
var path = require('path');

var GLOBAL = require ('../services/global');

var User = require('../models/user');
var Level = require ('../models/level');
var Evolution = require ('../models/evolution');
var Game = require('../models/game');

var Position = require('../models/position');
var Level_Goal = require('../models/level_goal');
var Level_Learning = require('../models/level_learning');
var Level_Action = require('../models/level_action');

var ObjectID = require('mongodb').ObjectID;
var table = 'Level';

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
    level.title = params.title;
    level.description = params.description;    
    level.evolution = params.evolution; 
    level.state = params.state; 
    level.image = '';
    level.time = params.time;   
    level.code_default = '';
    level.map = '';

    if (level.order && level.title && level.evolution && level.time && level.state){
        level.save((err,tupleAdd) => {
            if(err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                if(!tupleAdd){
                    res.status(404).send({message:'Nivel no registrado'});
                }else{
                    res.status(200).send({level: tupleAdd});
                }
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios'});
    }
}

/**
 * Obtener nivel a partir de su identificador
 * @return level: Nivel asociado al id
 */
function getLevel (req, res){
    var id = req.params.id;

    Level.findById(id).exec((err,tuple)=>{
        if(err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(!tuple){
                res.status(404).send({message:'Nivel no existe'});
            }else{    
                if (req.user.role != 'ROLE_ADMIN') {
                    Evolution.findById(tuple.evolution).exec((err,tupleEvolution) => {
                        if (err){
                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                        }else{
                            if (!tupleEvolution){
                                res.status(404).send({message:'Evolución no existe'});
                            }else{
                                User.findById(req.user.sub).populate({path:'level', populate : [ {path: 'evolution'}]}).exec((err,tupleUser) => {
                                    if (err) {
                                        res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                                    }else{
                                        if(!tupleUser){
                                            res.status(404).send({message: 'No existe tupla con dicho identificador: User'});  
                                        }else{                                
                                            if (tupleEvolution.order > tupleUser.level.evolution.order 
                                                || 
                                                ( tupleEvolution.order == tupleUser.level.evolution.order && tuple.order > tupleUser.level.order  )){
                                                res.status(401).send({message:"Sin permisos de acceso al nivel"});
                                            }else{
                                                res.status(200).send({level:tuple});
                                            }                                
                                        }
                                    }
                                });
                            }
                        }
                    });   
                }else{
                    res.status(200).send({level:tuple});
                }                                                           
            }
        }
    });   
}

/**
 * Obtener todos los niveles
 * @returns levels: Niveles solicitados
 */
function getLevels (req, res){

    Level.find({}).populate({path:'evolution'}).sort({evolution: 1, order: 1}).exec((err,tuples) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(tuples.length==0){
                res.status(404).send({message: 'Ningún nivel cumple los requisitos'}); 
            }else{                                                                         
                res.status(200).send({levels:tuples});
            }
        }
    });
}

/**
 * Obtener todos los niveles o los asociados a una determinada evolución
 * @returns levels: Niveles solicitados
 */
function getLevelsByEvolution (req, res){
    var id = req.params.evolution;
    var query = {active: 1, evolution: id};

    Evolution.findById(id).exec ( (err, tuple) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if (!tuple){
                res.status(404).send({message: 'Evolución no existe'}); 
            }else{
                
                if (req.user.role != 'ROLE_ADMIN') {
                    User.findById(req.user.sub).populate({path:'level', populate : [ {path: 'evolution'}]}).exec((err,tuple_user) => {
                        if (err) {
                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                        }else{
                            if(!tuple_user){
                                res.status(404).send({message: 'No existe tupla con dicho identificador: User'});  
                            }else{
                                if (tuple.order == tuple_user.level.evolution.order){
                                    getLevelsByEvolution_2(req, res, {active: 1, evolution: id , order: {$lte:tuple_user.level.order}});
                                }else if (tuple.order > tuple_user.level.evolution.order){
                                    res.status(404).send({message: 'Sin permisos para ver los niveles de la evolución'}); 
                                } else{
                                    getLevelsByEvolution_2(req, res, {active: 1, evolution: id});
                                }
                            }
                        }

                    });               
                }else{
                    getLevelsByEvolution_2(req, res, {active: 1, evolution: id});
                }                   
            }
        }
    });
}

function getLevelsByEvolution_2 (req, res, query) {
    Level.find(query).sort('order').exec((err,tuples) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(tuples.length==0){
                res.status(404).send({message: 'Ningún nivel cumple los requisitos'}); 
            }else{                                                                         
                res.status(200).send({levels:tuples});
            }
        }
    });
}

/**
 * Actualizar nivel
 * @returns level: Nivel antes de actualizar
 */
function updateLevel (req, res){
    var levelId = req.params.id;
    var update = req.body;

    if (update.order>0 && update.title.length>0 && update.evolution.length>0 && update.time>0){
        Level.findByIdAndUpdate(levelId,update,(err,tupleUpdate)=>{
            if(err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                if(!tupleUpdate){
                    res.status(404).send({message: 'Error al actualizar el nivel'}); 
                }else{
                    res.status(200).send({level: tupleUpdate}); 
                }
            }
        });
    }else{
        res.status(200).send({message:'rellene los campos obligatorios'});
    }
}

/**
 * Eliminar nivel
 * @param id: Identificador del nivel a eliminar
 * @param level: Nivel eliminado
 */
function removeLevel (req, res){
    var id = req.params.id;

    if (id !== GLOBAL.ID_FIRST_LEVEL){
        Level.findByIdAndRemove(id,(err,tupleRemove) => {
            if (err){
                res.status(500).send({message:'Error al eliminar: ' + table, messageError: err.message}); 
            }else{
                if(!tupleRemove){
                    res.status(404).send({message: 'Error al eliminar: ' + table});
                }else{            
                    res.status(200).send({level:tupleRemove});
                }
            }
        });
    }else{
        res.status(500).send({message:'Error al eliminar nivel: este nivel no se puede borrar'}); 
    }
}

/**
 * OPERACIONES ESPECIALES
 */

 /**
  * Activar el nivel
  * @returns level: Nivel antes de actualizar
  */
function activeLevel (req, res){
    var id = req.params.id;
    var query = {active:1};

    Level.findByIdAndUpdate(id,query,(err,levelUpdate) => {
        if (err){
            res.status(500).send({message: 'Error al activar el nivel', messageError: err.message});
        }else{
            if(!levelUpdate){
                res.status(404).send({message: 'No se ha podido activar el nivel'});
            }else{
                res.status(200).send({level:levelUpdate});
            }
        }
    });
}

/**
 * Desactivar nivel
 * @returns level: Nivel antes de desactivar
 */
function desactiveLevel (req,res){
    var id = req.params.id;
    var query = {active:0};

    Level.findByIdAndUpdate(id,query,(err,levelUpdate) => {
        if (err){
            res.status(500).send({message: 'Error al desactivar el nivel', messageError: err.message});
        }else{
            if(!levelUpdate){
                res.status(404).send({message: 'No se ha podido desactivar el nivel'});
            }else{
                res.status(200).send({level:levelUpdate});
            }
        }
    });
}

/**
 * Registrar el código Python pasado por parámetro en BBDD
 * @returns code: código traducido a JS
 */
function registerCode (req, res){
    var idLevel = req.params.id;
    var idUser = req.user.sub;
    var code = req.body.code;    
    var game = new Game();
    var parama_id;        

    if (code){ 

        Game.find({ user:idUser, level:idLevel }).exec( (err, tuples) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                // Registramos tupla
                if(tuples.length==0){                    
                    game.level = idLevel;
                    game.user = idUser;
                    game.code = code;

                    game.save((err,tupleAdd) => {
                        if(err){
                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                        }else{
                            if(!tupleAdd){
                                res.status(404).send({message:'Error al registrar el código'});
                            }else{
                                res.status(200).send({message: 'Código registrado correctamente'});
                            }
                        }
                    });
                // Actualizamos tupla    
                }else{
                    parama_id = new ObjectID(tuples[0]._id);
                    game.code = code;                           
                    game._id = parama_id;             

                    Game.findByIdAndUpdate(parama_id, game, (err, tupleUpdate) => {
                        if(err){
                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                        }else{
                            if(!tupleUpdate){
                                res.status(404).send({message: 'Error al actualizar el código'}); 
                            }else{
                                res.status(200).send({message: 'Código actualizado correctamente'});
                            }
                        }
                    });
                }
            }
        });
    }
}

/**
 * Subir fichero con código por defecto del nivel
 * @returns level: Contenido del nivel antes de la actualización. code_default: Nombre del fichero subido
 */
function uploadCode (req, res){
    var id = req.params.id;
    var file_name = 'No subido...';
    var field;

    if (req.files.file){
        var file_path = req.files.file.path;
        var file_name = file_path.split('\/')[3];
        var ext = file_name.split('\.')[1];        
        field = {code_default: file_name};                   
        if (ext=='txt'){
            Level.findByIdAndUpdate(id, field, (err,tupleUpdate) => {
                if (err){
                    res.status(500).send({message:'Error en la subida del fichero: ' + table, messageError: err.message});
                }else{
                    if(!tupleUpdate){
                        res.status(404).send({message: 'No se ha podido actualizar el fichero del nivel'});
                    }else{
                        let file_path_old = GLOBAL.PATH_FILE_LEVEL_C + tupleUpdate.code_default;                        
                        fs.exists(file_path_old, (exists) => {
                            if(exists){
                                fs.unlink(file_path_old)
                            }
                        });
                        res.status(200).send({file:file_name, level:tupleUpdate});
                    }
                }
            });
        }else{
            res.status(200).send({message:'Extensión del archivo no válida (.txt)'});
        }        
    }else{
        res.status(200).send({message:'Fichero no subido'});
    }
}

/**
 * Obtener código del nivel: de la tabla Game si existo. Sino del fichero con código por defecto
 * @returns code: código del nivel
 */
function loadCode (req, res) {
    var idLevel = req.params.id;
    var idUser = req.user.sub;
    var code = '';
    var path = GLOBAL.PATH_FILE_LEVEL_C;

    Game.find({level:idLevel, user:idUser}).exec( (err,tuples) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            // Comprobar si el usuario ha modificado el código del nivel
            if (tuples.length == 0){ 
                Level.findById(idLevel).exec( (err, level) => {
                    if (err){
                        res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                    }else{
                        if (!level){
                            res.status(404).send({message:'El nivel no existe'})
                        }else{
                            var path_file = path + level.code_default;

                            fs.exists(path_file, (exists) => {
                                if(exists){
                                    fs.readFile(path_file, 'utf-8', (err, data) => {
                                        if (err){
                                            res.status(500).send({message: 'Error al leer fichero', messageError: err.message});
                                        }else{                                            
                                            res.status(200).send({code:data});
                                        }
                                    });
                                }else{
                                    res.status(404).send({message:'El fichero no existe'}); 
                                }
                            });                  
                                                        

                        }
                    }
                });               
                
            }else{
                code = tuples[0].code;
                res.status(200).send({code});
            }            
        }
    });    
}

/**
 * Pasar parámetro con el nivel pasado y actualizarlo si es el actual
 * @returns level: siguiente nivel si existe
 */ 

function nextLevel (req, res){

    var user, level_param;    
    
    // Obtenemos información usuario
    User.findById(req.user.sub).populate({path:'level', populate : [ {path: 'evolution'}]}).exec((err,tuple_user) => {
        if (err) {
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(!tuple_user){
                res.status(404).send({message: 'No existe tupla con dicho identificador: User'});  
            }else{                                                 
                user = tuple_user;

                // Obtenemos información nivel pasado por parametro
                Level.findById(req.params.id).populate({path:'evolution'}).exec( (err, tuple_level) => {
                    if (err) {
                        res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                    }else{
                        if(!tuple_level){
                            res.status(404).send({message: 'No existe tupla con dicho identificador: Level'}); 
                        }else{
                            level_param = tuple_level;

                            // Comprobamos si existe siguiente nivel en la misma evolución
                            Level.find({evolution:level_param.evolution._id, order:{$gt: level_param.order}}).populate({path:'evolution'}).sort('order').exec ( (err, tuples_level) => {
                                if (err){
                                    res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                                }else{
                                    if (tuples_level.length > 0){                                                                                
                                        if (String(level_param._id) === String(user.level._id)){                 
                                            user.level = tuples_level[0]._id;
                                            User.findByIdAndUpdate(user._id, user,(err,tuple) => {                                                                        
                                            });    
                                        }                                           
                                        res.status(200).send({level: tuples_level[0]}); // Siguiente nivel misma evolución
                                    }else{
                                        // Comprobamos si existe proxima evolución
                                        Evolution.find({order:{$gt: level_param.evolution.order}}).sort('order').exec ( (err, tuples_evolution) => {
                                            if (err){
                                                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                                            }else{
                                                if (tuples_evolution.length > 0){ 
                                                    Level.find({evolution:tuples_evolution[0],order:1}).populate({path:'evolution'}).exec( (err,tuples_level_2) => {
                                                        if(err){
                                                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                                                        }else{
                                                            if (tuples_level_2.length > 0){                                                                             
                                                                if (String(level_param._id) === String(user.level._id)){                 
                                                                    user.level = tuples_level_2[0]._id;
                                                                    User.findByIdAndUpdate(user._id, user, (err,tuple) => {                                                                        
                                                                    });  
                                                                }                                           
                                                                res.status(200).send({level: tuples_level_2[0]}); // Siguiente nivel siguiente evolución
                                                            }else{
                                                                res.status(200).send({message: 'Juego superado'});
                                                            }
                                                        }
                                                    });
                                                } else {
                                                    res.status(200).send({message: 'Juego superado'});
                                                }
                                            }
                                        }); 
                                    }
                                }
                            });
                        }
                    }
                });
            }
        }
    });             
}

/**
 * OPERACIONES EDICIÓN 
 */

// POSICIONES

/**
 * Añadir nueva posición al nivel
 * @returns position: Posición añadida al nivel
 */
function addPosition (req, res) {
    var position = new Position();
    var id_level = req.params.level;
    var params = req.body; 

    position.level = id_level;
    position.value_x = params.value_x;
    position.value_y = params.value_y;

    if (position.value_x && position.value_y){
        position.save((err,tupleAdd) => {
            if(err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                if(!tupleAdd){
                    res.status(404).send({message:'Posición no registrada'});
                }else{
                    res.status(200).send({position: tupleAdd});
                }
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios'});
    }
}

/**
 * Eliminar posición
 * @param id: Identificador de la posición
 * @param position: Posición eliminada
 */
function removePosition (req, res){
    var id = req.params.id;
    var table_2 = 'Position';

    Position.findByIdAndRemove(id,(err,tupleRemove) => {
        if (err){
            res.status(500).send({message:'Error al eliminar: ' + table_2, messageError: err.message}); 
        }else{
            if(!tupleRemove){
                res.status(404).send({message: 'Error al eliminar: ' + table_2});
            }else{            
                res.status(200).send({position:tupleRemove});
            }
        }
    });
}

/**
 * Obtener todas las posiciones asociadas al nivel
 * @returns positions: Listado con las posiciones asociadas al nivel
 */
function getPositions (req,res) {
    var id = req.params.level;
    var query = {level: id};

    Position.find(query).exec((err,tuples) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
        }else{
            if(tuples.length==0){
                res.status(200).send({message: 'Ninguna posición marcada en el nivel'}); 
            }else{                                                                         
                res.status(200).send({positions:tuples});
            }
        }
    });
}

// OBJETIVOS

/**
 * Asociar nuevo objetivo al nivel. Si ya existe, lo actualiza con los nuevos parámetros
 * @returns level_goal: Relación nivel-objetivo añadida 
 */
function addGoal (req, res) {
    var level_goal = new Level_Goal();    
    var params = req.body; 

    level_goal.level = params.level;
    level_goal.goal = params.goal;
    level_goal.value1 = params.value1;
    level_goal.value2 = params.value2;

    if (level_goal.level && level_goal.goal){
        Level_Goal.find({level:level_goal.level, goal: level_goal.goal}).exec( (err,tuples) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                // Objetivo no asocido al nivel
                if (tuples.length == 0){
                    level_goal.save((err,tupleAdd) => {
                        if(err){
                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                        }else{
                            if(!tupleAdd){
                                res.status(404).send({message:'Objetivo no asociado al nivel'});
                            }else{
                                res.status(200).send({level_goal: tupleAdd});
                            }
                        }
                    });
                }else{
                    //Exite la relación objetivo-nivel
                    var id = tuples[0]._id;
                    level_goal._id = id;

                    Level_Goal.findByIdAndUpdate(id,level_goal, (err, tupleUpdate) => {
                        if (err){
                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                        }else{
                            if (!tupleUpdate){
                                res.status(404).send({message:'Objetivo de nivel no actualizado'});
                            }else{
                                res.status(200).send({level_goal: tupleUpdate});
                            }
                        }
                    });
                }
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios'});
    }
}

/**
 * Eliminar objetivo del nivel
 * @param id: Identificador de la relación objetivo nivel
 * @returns level_goal: Relación nivel-objetivo eliminada
 */
function removeGoal (req, res){
    var id = req.params.id;
    var table_2 = 'Goal-Level';

    Level_Goal.findByIdAndRemove(id,(err,tupleRemove) => {
        if (err){
            res.status(500).send({message:'Error al eliminar: ' + table_2, messageError: err.message}); 
        }else{
            if(!tupleRemove){
                res.status(404).send({message: 'Error al eliminar: ' + table_2});
            }else{            
                res.status(200).send({level_goal:tupleRemove});
            }
        }
    });
}


// LEARNING

/**
 * Asociar nuevo aprendizaje al nivel. Si ya existe la asociación no hago nada.
 * @returns level_learning: Relación nivel-aprendizaje añadida 
 */
function addLearning (req, res) {
    var level_learning = new Level_Learning();    
    var params = req.body; 

    level_learning.level = params.level;
    level_learning.learning = params.learning;        

    if (level_learning.level && level_learning.learning){
        Level_Learning.find({level:level_learning.level, learning: level_learning.learning}).exec( (err,tuples) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                // Aprendizaje no asocido al nivel
                if (tuples.length == 0){
                    level_learning.save((err,tupleAdd) => {
                        if(err){
                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                        }else{
                            if(!tupleAdd){
                                res.status(404).send({message:'Aprendizaje no asociado al nivel'});
                            }else{
                                res.status(200).send({level_learning: tupleAdd});
                            }
                        }
                    });
                }else{
                    res.status(200).send({message: 'Aprendizaje ya asociado al nivel'})
                }
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios'});
    }
}

/**
 * Eliminar aprendizaje del nivel
 * @param id: Identificador de la relación aprendizaje nivel
 * @returns level_learning: Relación nivel-aprendizaje eliminada
 */
function removeLearning (req, res){
    var id = req.params.id;
    var table_2 = 'Learning-Level';

    Level_Learning.findByIdAndRemove(id,(err,tupleRemove) => {
        if (err){
            res.status(500).send({message:'Error al eliminar: ' + table_2, messageError: err.message}); 
        }else{
            if(!tupleRemove){
                res.status(404).send({message: 'Error al eliminar: ' + table_2});
            }else{            
                res.status(200).send({level_learning:tupleRemove});
            }
        }
    });
}


// ACTION

/**
 * Asociar nueva acción al nivel. Si ya existe la asociación no hago nada.
 * @returns level_action: Relación nivel-acción añadida 
 */
function addAction (req, res) {
    var level_action = new Level_Action();    
    var params = req.body; 

    level_action.level = params.level;
    level_action.action = params.action;        

    if (level_action.level && level_action.action){
        Level_Action.find({level:level_action.level, action: level_action.action}).exec( (err,tuples) => {
            if (err){
                res.status(500).send({message: 'Error en el servidor', messageError: err.message});
            }else{
                // Acción no asocido al nivel
                if (tuples.length == 0){
                    level_action.save((err,tupleAdd) => {
                        if(err){
                            res.status(500).send({message: 'Error en el servidor', messageError: err.message});
                        }else{
                            if(!tupleAdd){
                                res.status(404).send({message:'Acción no asociada al nivel'});
                            }else{
                                res.status(200).send({level_action: tupleAdd});
                            }
                        }
                    });
                }else{
                    res.status(200).send({message: 'Acción ya asociada al nivel'})
                }
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios'});
    }
}

/**
 * Eliminar acción del nivel
 * @param id: Identificador de la relación acción nivel
 * @returns level_action: Relación nivel-acción eliminada
 */
function removeAction (req, res){
    var id = req.params.id;
    var table_2 = 'Learning-Action';

    Level_Action.findByIdAndRemove(id,(err,tupleRemove) => {
        if (err){
            res.status(500).send({message:'Error al eliminar: ' + table_2, messageError: err.message}); 
        }else{
            if(!tupleRemove){
                res.status(404).send({message: 'Error al eliminar: ' + table_2});
            }else{            
                res.status(200).send({level_action:tupleRemove});
            }
        }
    });
}

/**
 * OPERACIONES CARGA Y SUBIDA DE FICHEROS
 */

 /**
 * Subir imágen del nivel a partir de su id
 * @returns image: Nombre de la imagen. 
 *          level: Nivel antes de la actualización.
 */
function uploadILevel (req, res){
    var id = req.params.id;
    var file_name = 'No subido...';
    var field;

    if (req.files.image){
        var file_path = req.files.image.path;
        var file_name = file_path.split('\/')[3];
        var ext = file_name.split('\.')[1];        
        field = {image: file_name};                   
        if (ext=='png' || ext == 'jpg'){
            Level.findByIdAndUpdate(id, field, (err,tupleUpdate) => {
                if (err){
                    res.status(500).send({message:'Error en la subida de la imágen: ' + table, messageError: err.message});
                }else{
                    if(!tupleUpdate){
                        res.status(404).send({message: 'No se ha podido actualizar la imagen del nivel'});
                    }else{
                        let file_path_old = GLOBAL.PATH_FILE_LEVEL_I + tupleUpdate.image;                        
                        fs.exists(file_path_old, (exists) => {
                            if(exists){
                                fs.unlink(file_path_old)
                            }
                        });
                        res.status(200).send({image:file_name, level:tupleUpdate});
                    }
                }
            });
        }else{
            res.status(200).send({message:'Extensión del archivo no válida (.png, .jpg)'});
        }        
    }else{
        res.status(200).send({message:'Imagen no subida'});
    }
}

 /**
 * Subir imágen del nivel a partir de su id
 * @returns image: Nombre de la imagen. 
 *          level: Nivel antes de la actualización.
 */
function uploadMapLevel (req, res){
    var id = req.params.id;
    var file_name = 'No subido...';
    var field;

    if (req.files.file){
        var file_path = req.files.file.path;
        var file_name = file_path.split('\/')[3];
        var ext = file_name.split('\.')[1];        
        field = {map: file_name};                   
        if (ext=='json'){
            Level.findByIdAndUpdate(id, field, (err,tupleUpdate) => {
                if (err){
                    res.status(500).send({message:'Error en la subida del mapa: ' + table, messageError: err.message});
                }else{
                    if(!tupleUpdate){
                        res.status(404).send({message: 'No se ha podido actualizar el mapa del nivel'});
                    }else{
                        let file_path_old = GLOBAL.PATH_FILE_LEVEL_M + tupleUpdate.map;                        
                        fs.exists(file_path_old, (exists) => {
                            if(exists){
                                fs.unlink(file_path_old)
                            }
                        });
                        res.status(200).send({file:file_name, level:tupleUpdate});
                    }
                }
            });
        }else{
            res.status(200).send({message:'Extensión del archivo no válida (.json)'});
        }        
    }else{
        res.status(200).send({message:'Fichero no subido'});
    }
}

/**
 * Cargar fichero de nivel
 * @return fichero solicitado
 */
function loadFileLevel (req, res){
    //Obtener parametros
    var nameFile = req.params.nameFile;
    var type = req.params.type;
    var path_file;
    var global_path;
    var field;
    
    switch(type){
        case 'I':
            global_path = GLOBAL.PATH_FILE_LEVEL_I;            
            break;
        case 'M':
            global_path = GLOBAL.PATH_FILE_LEVEL_M;            
            break;
        case 'C':
            global_path = GLOBAL.PATH_FILE_LEVEL_C;            
            break;
        default:
            return res.status(500).send({message: 'Error al cargar fichero: tipo indicado desconocido'});
    }


    if (!nameFile){
        var id = req.params.id;        

        Level.findById(id).exec((err,level)=>{            
            if (err){
                res.status(500).send({message:'Error en la carga del fichero: ' + table, messageError: err.message});
            }else{
                if(!level){
                    res.status(404).send({message: 'No existe el nivel'}); 
                }else{        
                    
                    if (type == 'I'){
                        nameFile = level.image;
                    }
                    if (type == 'M'){
                        nameFile = level.map;
                    }                
                    path_file = global_path + nameFile;                    
                    fs.exists(path_file, (exists) => {
                        if(exists){
                            res.sendFile(path.resolve(path_file));
                        }else{
                            res.status(404).send({message:'El fichero no existe'}); 
                        }
                    });                  
                }
            }
        });
    }else{
        path_file = global_path + nameFile;
        fs.exists(path_file, (exists) => {
            if(exists){
                res.sendFile(path.resolve(path_file));
            }else{
                res.status(404).send({message:'El fichero no existe'}); 
            }
        });
    }
}




module.exports = {
    addLevel,
    getLevel,
    getLevels,
    getLevelsByEvolution,
    updateLevel,
    removeLevel,
    activeLevel,
    desactiveLevel,
    registerCode,
    uploadCode,
    loadCode,
    nextLevel,
    addPosition,
    removePosition,
    getPositions,
    addGoal,
    removeGoal,
    addLearning,
    removeLearning,
    addAction,
    removeAction,
    uploadILevel,
    uploadMapLevel,
    loadFileLevel
};