'use strict'

var Evolution = require ('../models/evolution');
var GLOBAL = require ('../services/global');

/**
 * Obtener evolución a partir de id
 * @returns evolution: evolución asociada al id
 */
function getEvolution (req, res){
    var evolutionId = req.params.id;

    Evolution.findById(evolutionId).exec((err,evolution)=>{
        if (err){
            res.status(500).send({message: 'Error en el servidor'});
        }else{
            if(!evolution){
                res.status(404).send({message: 'No existe la evolución'}); 
            }else{
                res.status(200).send({evolution});
            }
        }
    });

}

/**
 * Obtener todas las evoluciones
 * @returns evolutions: Evoluciones registradas en el sistema
 */
function getEvolutions (req,res){
    
    Evolution.find({}).sort('order').exec((err,evolutions) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor'});
        }else{
            if(!evolutions){
                res.status(404).send({message: 'No hay evoluciones'}); 
            }else{
                res.status(200).send({evolutions});
            }
        }
    });

}

/**
 * Registrar nueva evolución en BBDD
 * @returns evolution: Evolución creada
 */
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
function updateEvolution (req,res){

}

//uploadIEvolution: Subir imagen evolucion
function uploadIEvolution (req,res){

}

//loadIUser: Carga imagen evolución
function loadIUser (req,res){

}

//uploadISEvolution: Subir imagen pequeña evolucion
function uploadISEvolution (req,res){

}

//loadISEvolutionUser: Carga imagen pequeña evolución
function loadISEvolutionUser (req,res){

}

module.exports = {
    getEvolution,
    getEvolutions,
    addEvolution,
    updateEvolution,
    uploadIEvolution,
    loadIUser,
    uploadISEvolution,
    loadISEvolutionUser
};