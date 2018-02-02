'use strict'

var Level = require ('../models/level');

//getLevel: Obtener nivel a partir de su id con populate de evolution

//getLevels: Obtener todos los niveles o los asociados a una evolución pasada por parámetro. Solo mostrar los activos


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

//updateLevel: Actualizar nivel 

//desactiveLevel: Desactivar nivel (active = 0)


module.exports = {
    addLevel
};