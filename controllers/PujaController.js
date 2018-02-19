var jwt = require('jsonwebtoken');
var mongoAccess = require("mongodb").MongoClient;
var objectID = require('mongodb').ObjectID;
const encryptionKey = '.!?jkasxLjs?';

Puja = require("../model/Puja");

function returnCommonResponse(res, httpCode, json){
    res.status(httpCode);
    res.json(json);
    return res;
}

module.exports = function(app){
    
    //create bid
    app.post("/bid", function(req, res){
        console.log("create bid - init");
        
        var authToken = req.body.authToken || req.query.authToken || req.get('authToken');
        var username;
        
        jwt.verify(authToken, encryptionKey, function(err, resToken){
           username = resToken.username;
        });
        mongoAccess.v
        if(!req.body.username 
                || isNaN(req.body.amount)
                || !objectID.isValid(req.body.event)
                || !username === req.body.username){
            
            res = returnCommonResponse(res, 400, {
                created: false,
                message: "Parámetros incorrectos!"
            });
            console.log("Detalles de la puja incorrectos " + 
                    req.body.username,
                    req.body.amount,
                    req.body.event);
            return this;
        }
        
        mongoAccess.connect('mongodb://usuario:1234@ds123658.mlab.com:23658/masterunir',
        function(err, db) {
            if (err) {
                console.log("Error conectando a la BD " + err);
                res = returnCommonResponse(res, 500, {
                    created: false,
                    message: "DB error"
                });
            } else {
                console.log("Conectado correctamente a MongoDB");
                
                var eventsCollection = db.collection('events');
                var bidsCollection = db.collection('bids');
                
                var eventId = require('mongodb').ObjectID(req.body.event);
                
                eventsCollection.find({_id: eventId}).toArray(function(err, result){
                    console.log("result: " + result);
                    if(err){
                        console.log("Error buscando evento en DB");
                        res = returnCommonResponse(res, 500, {
                            found: false,
                            message: "Error buscando evento en DB"
                        });
                    }else if(result.length == 0){
                        console.log("Evento inexistente");
                        res = returnCommonResponse(res, 500, {
                            found: false,
                            message: "Evento " + eventId + " inexistente"
                        });
                    }else{
                        var bid = new Puja(
                                username,
                                parseFloat(req.body.amount),
                                req.body.event);

                        bidsCollection.insert(bid, function (err, result) {
                            if (err) {
                                console.log("Error insertando puja en BD " + err);
                                res = returnCommonResponse(res, 400, {
                                    created: false,
                                    message: "DB error"
                                });
                            } else {
                                console.log("Puja creada");
                                res = returnCommonResponse(res, 200, {
                                    created: true,
                                    message: "Puja creada satisfactoriamente",
                                    details : JSON.stringify(result.ops[0])
                                });
                            }
                            db.close();
                        });
                    }
                    db.close();
                });
            }
        });
        console.log("create bid - end");
    });
    
    //Delete bid
    app.delete("/bid", function(req, res){
        console.log("delete bid - init");
        
        if(!objectID.isValid(req.body.id)){
            res = returnCommonResponse(res, 400, {
                deleted: false,
                message: "Detalles del puja incorrectos!"
            });
        }else{
            mongoAccess.connect('mongodb://usuario:1234@ds123658.mlab.com:23658/masterunir',
            function(err, db) {
                if (err) {
                    console.log("Error conectando a la BD " + err);
                    res = returnCommonResponse(res, 500, {
                        deleted: false,
                        message: "DB error"
                    });
                } else {
                    console.log("Conectado correctamente a MongoDB");

                    var collection = db.collection('bids');
                    var bidId = require('mongodb').ObjectID(req.body.id);

                    collection.remove({_id : bidId}, function (err, response) {
                        if (err || response.result.n == 0) {
                            console.log("Error al eliminar puja " + err);
                            res = returnCommonResponse(res, 400, {
                                deleted: false,
                                message: "Error eliminando puja"
                            });
                        } else {
                            console.log("puja eliminada: " + bidId);
                            res = returnCommonResponse(res, 410, {
                                deleted: true,
                                message: "Puja eliminada correctamente"
                            });
                        }
                        db.close();
                    });
                }
            });
            console.log("delete bid - end");
        }
    });
    
    //Read bid
    app.get("/bid/:id", function(req, res){
        console.log("getting bid - init");
        
        mongoAccess.connect('mongodb://usuario:1234@ds123658.mlab.com:23658/masterunir',
        function(err, db) {
            if (err) {
                console.log("Error  conectando a la BD " + err);
                res = returnCommonResponse(res, 500, {
                    found: false,
                    message: "DB error"
                });
            } else {
                console.log("Conectado correctamente a MongoDB");

                var collection = db.collection('bids');
                var bidId = require('mongodb').ObjectID(req.params.id);
                
                collection.find({_id: bidId}).toArray(function(err, result){
                    console.log("result: " + result);
                    if(err){
                        console.log("Error buscando puja en DB");
                        res = returnCommonResponse(res, 500, {
                            found: false,
                            message: "Error buscando puja en DB"
                        });
                    }else if(result.length == 0){
                        console.log("Puja no encontrada");
                        res = returnCommonResponse(res, 500, {
                            found: false,
                            message: "Puja " + bidId + " no encontrada en DB"
                        });
                    }else{
                        res = returnCommonResponse(res, 200, {
                            found: true,
                            message: "Puja encontrada",
                            details: result[0]
                        });
                    }
                    db.close();
                });
            }
        });
        console.log("getting bid - end");
    });
   
}