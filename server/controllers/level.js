'use strict'

var Level = require ('../models/level');

/**
 * Obtener nivel a partir de su identificador
 * @return level: Nivel asociado al id
 */
function getLevel (req, res){
    var levelId = req.params.id;

    Level.find({_id: levelId, active: 1}).populate({path:'evolution'}).exec((err,level)=>{
        if(err){
            res.status(500).send({message:'Error en la petición'});
        }else{
            if(!level){
                res.status(404).send({message:'El nivel no existe'});
            }else{
                var levelAux = level[0];
                res.status(200).send({level:levelAux});
                //Comprobar que el usuario puede acceder al nivel
                /*Level.findById(req.user.level._id).populate({path:'evolution'}).exec((err,levelUser)=>{
                    if (err){
                        res.status(500).send({message:'Error en la petición'});
                    }else{
                        if(!levelUser){
                            res.status(404).send({message:'El nivel asignado al usuario no existe'});
                        }else{
                            //Si la evolucion del usuario es mayor a la del nivel o misma y orden de nivel menor igual al del usuario
                            if(levelUser.evolution.order>levelAux.evolution.order || (levelUser.evolution.order==levelAux.evolution.order && levelAux.order <= levelUser.order)){
                                res.status(200).send({level:levelAux});
                            }else{
                                res.status(404).send({message:'Sin permisos de acceso al nivel'});
                            }                                                
                        }
                    }
                });  */              
            }
        }
    });   
}

/**
 * Obtener todos los niveles o los asociados a una determinada evolución
 * @returns levels: Niveles solicitados
 */
function getLevels (req, res){
    var evolutionId = req.params.evolution;
    var query;
    var order = req.params.order;

    if (order){
        query = {active: 1, evolution: evolutionId, 'order':{$lte:order}};
    }else{
        query = {active: 1, evolution: evolutionId};
    }

    Level.find(query).sort('order').exec((err,levels)=>{
        if (err){
            res.status(500).send({message: 'Error en el servidor'});
        }else{
            if(!levels){
                res.status(404).send({message: 'No hay niveles'}); 
            }else{
                res.status(200).send({levels});
            }
        }
    });
}

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

    if (level.order && level.title && level.evolution){
        level.save((err,levelAdd) => {
            if(err){
                res.status(500).send({message:'Error al guardar el nivel'});
            }else{
                if(!levelAdd){
                    res.status(404).send({message:'Nivel no registrado'});
                }else{
                    res.status(200).send({level: levelAdd});
                }
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios'});
    }
}

/**
 * Actualizar nivel
 * @returns level: Nivel antes de actualizar
 */
function updateLevel (req, res){
    var levelId = req.params.id;
    var update = req.body;

    Level.findByIdAndUpdate(levelId,update,(err,levelUpdate)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!levelUpdate){
                res.status(404).send({message: 'No se ha actualizado el nivel'}); 
            }else{
                res.status(200).send({level: levelUpdate}); 
            }
        }
    });
}

/**
 * Desactivar nivel
 * @returns level: Nivel antes de desactivar
 */
function desactiveLevel (req,res){
    var levelId = req.params.id;    

    Level.findByIdAndUpdate(levelId,{active:0},(err,levelUpdate)=>{
        if(err){
            res.status(500).send({message: err});
        }else{
            if(!levelUpdate){
                res.status(404).send({message: 'No se ha desactivado el nivel'}); 
            }else{
                res.status(200).send({level: levelUpdate}); 
            }
        }
    });
}

function translateCode (req, res){
    var code = req.body;    
    var code_translate = code;
    res.status(200).send({code : code_translate});
}

module.exports = {
    getLevel,
    getLevels,
    addLevel,
    updateLevel,
    desactiveLevel,
    translateCode
};