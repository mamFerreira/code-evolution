'use strict'

var Evolution = require ('../models/evolution');

//getEvolution: Obtener una evolución a partir de su id

//getEvolutions: Obtener todas las evoluciones 

function addEvolution (req, res){
    var evolution = new Evolution();
    var params = req.body; //Recogemos los datos que llegan por POST

    evolution.order = params.order;
    evolution.name = params.name;
    evolution.description = params.description;    
    evolution.image = '';
    
    if (evolution.order && evolution.name){
        evolution.save((err,evolutionAdd) => {
            if(err){
                res.status(500).send({message:'Error al guardar evolución'});
            }else{
                if(!evolutionAdd){
                    res.status(404).send({message:'Evolución no registrada'});
                }else{
                    res.status(200).send({evolution: evolutionAdd});
                }
            }
        });
    }else{
        res.status(200).send({message:'Rellena los campos obligatorios'});
    }
}

//updateEvolution: Actualizar evolución 

//uploadIEvolution: Subir imagen evolucion

//loadIUser: Carga imagen evolución



module.exports = {
    addEvolution
};