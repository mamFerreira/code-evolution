'use strict'

var mongo = require('mongodb');
var Game = require ('../models/game');
var GLOBAL = require ('../services/global');


/**
 * Registrar nueva partida en BBDD. Por defecto lo asigna al primer nivel. 
 * Actualiza si existe y elimina en caso contrario
 * @returns game: Partida creada
 */
function registerGame (req, res){
    var game = new Game();
    var params = req.body; //Recogemos los datos que llegan por POST

    game.code = params.code;
    game.overcome = params.overcome || false;    
    game.userID = params.userID;
    game.levelID = params.levelID || GLOBAL.ID_FIRST_LEVEL;    
    
    if (game.userID && game.levelID){
        //Comprobamos si existe otra partida guardada para el mismo jugador y nivel
        Game.findOne({userID:game.userID, levelID:game.levelID},(err,game_db) => {
            if(err){                
                res.status(500).send({message:'Error en el servidor', messageError:err.message});  
            }else{
                if (game_db){
                    game._id = game_db._id;
                    Game.findOneAndUpdate({_id: game_db._id},game,(err,gameUpdate) => {
                        if (err){
                            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
                        }else{
                            if(!gameUpdate){
                                res.status(404).send({message: 'Error: la partida no ha podido actualizarse'});
                            }else{
                                res.status(200).send({game: gameUpdate});
                            }
                        }
                    });                    
                }else{
                    game.save((err,gameAdd) => {
                        if(err){
                            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
                        }else{
                            if(!gameAdd){
                                res.status(404).send({message:'Error: La partida no ha sido creada'});
                            }else{
                                res.status(200).send({game: gameAdd});
                            }
                        }
                    });
                }
            }
        });        
    }else{
        res.status(200).send({message:'Error: Los campos userID y levelID son obligatorios'});
    }
}


/**
 * Obtener partidas registradas
 * @param id: Identificador de la partida deseada (opcional)
 * @returns games: Partidas solicitadas
 */
function getGames (req, res){
    var query = {}

    if (req.params.userID && req.params.levelID){
        var userID = new mongo.ObjectID(req.params.userID);
        var levelID = new mongo.ObjectID(req.params.levelID);
        query = { 'userID' : userID, 'levelID' : levelID };
    }         

    Game.find(query).exec((err,games) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message});  
        }else{
            if (!games){
                res.status(200).send({message: 'Ninguna partida registrada en el sistema'});
            }else{
                res.status(200).send({games});                
            }
        }
    });
}

/**
 * Eliminar partida
 * @param id: Identificador de la partida a eliminar
 * @param game: Partida elimada
 */
function removeGame (req, res){
    var id = req.params.id;

    Game.findByIdAndRemove(id,(err,game) => {
        if (err){
            res.status(500).send({message:'Error en el servidor', messageError:err.message}); 
        }else{
            if(!game){
                res.status(404).send({message: 'Error: No ha podido eliminarse el registro'}); 
            }else{                
                res.status(200).send({game});
            }
        }
    });
}

module.exports = {
    registerGame,
    getGames,
    removeGame
};