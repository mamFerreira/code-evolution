'use strict'

var fs = require('fs');
var path = require('path');
var Evolution = require ('../models/evolution');
var Level = require('../models/level');
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
    
    var aux = {};

    Evolution.find({}).sort('order').exec((err,evolutions) => {
        if (err){
            res.status(500).send({message: 'Error en el servidor'});
        }else{
            if(!evolutions){
                res.status(404).send({message: 'No hay evoluciones'}); 
            }else{                                            
                evolutions.forEach(evolution => {        
                    Level.find({"evolution" : evolution._id}).count( (err,count) => {
                        if (err){
                            res.status(500).send({message: 'Error en el servidor'});
                        }else{
                            
                            if(!count){
                                count=0;
                            }
                            aux[evolution._id] = count;                    
                            console.log(aux);        
                        }
                    });                    
                });                
                res.status(200).send({evolutions,aux});
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

/**
 * Actualizar evolución
 * @returns evolution: Evolución antes de la actualización
 */
function updateEvolution (req,res){
    var evolId = req.params.id;
    var update = req.body;     

    Evolution.findByIdAndUpdate(evolId,update,(err,evolUpdate) => {
        if (err){
            console.log(err);
            res.status(500).send({message:'Error al actualizar la evolución'}); 
        }else{
            if(!evolUpdate){
                res.status(404).send({message: 'No se ha podido actualizar la evolución'});
            }else{
                res.status(200).send({evolution:evolUpdate});
            }
        }
    })
}

/**
 * Subir imágen de la evolución
 * @returns image: Nombre de la imagen. Evolutión: Evolución antes de la actualización
 */
function uploadIEvolution (req,res){
    var evolId = req.params.id;
    var file_name = 'No subido...';

    if (req.files.image){
        var file_path = req.files.image.path;
        var file_name = file_path.split('\/')[2];
        var ext = file_name.split('\.')[1];

        if (ext=='png' || ext=='jpg' || ext=='gif' || ext=='jpeg'){
            Evolution.findByIdAndUpdate(evolId,{image:file_name}, (err,evolUpdate) => {
                if (err){
                    console.log(err);
                    res.status(500).send({message:'Error al actualizar la imagen de la evolución'}); 
                }else{
                    if(!evolUpdate){
                        res.status(404).send({message: 'No se ha podido actualizar la imagen de la evolución'});
                    }else{
                        res.status(200).send({image:file_name, evolution:evolUpdate});
                    }
                }
            });
        }else{
            res.status(200).send({message:'Extensión del archivo no valida (.png .jpg .gif .jpeg)'});
        }        
    }else{
        res.status(200).send({message:'Imagen no subida'});
    }
}

/**
 * Subir imágen de la evolución
 * @returns image: Nombre de la imagen. Evolutión: Evolución antes de la actualización
 */
function uploadISEvolution (req,res){
    var evolId = req.params.id;
    var file_name = 'No subido...';

    if (req.files.image){
        var file_path = req.files.image.path;
        var file_name = file_path.split('\/')[2];
        var ext = file_name.split('\.')[1];

        if (ext=='png' || ext=='jpg' || ext=='gif' || ext=='jpeg'){
            Evolution.findByIdAndUpdate(evolId,{image_small:file_name}, (err,evolUpdate) => {
                if (err){
                    console.log(err);
                    res.status(500).send({message:'Error al actualizar la imagen de la evolución'}); 
                }else{
                    if(!evolUpdate){
                        res.status(404).send({message: 'No se ha podido actualizar la imagen de la evolución'});
                    }else{
                        res.status(200).send({image:file_name, evolution:evolUpdate});
                    }
                }
            });
        }else{
            res.status(200).send({message:'Extensión del archivo no valida (.png .jpg .gif .jpeg)'});
        }        
    }else{
        res.status(200).send({message:'Imagen no subida'});
    }
}

/**
 * Cargar imagen de evolución
 * @return imagen de evolución
 */
function loadIEvolution (req,res){
    var imageFile = req.params.imageFile;
    var path_file = GLOBAL.PATH_FILE_EVOLUTION + imageFile;

    fs.exists(path_file, (exists) => {
        if(exists){
            res.sendFile(path.resolve(path_file));
        }else{
            res.status(404).send({message:'La imagen no existe'}); 
        }
    });
}

module.exports = {
    getEvolution,
    getEvolutions,
    addEvolution,
    updateEvolution,
    uploadIEvolution,    
    uploadISEvolution,
    loadIEvolution
};