const moment = require('moment');
var mongoAccess = require("mongodb").MongoClient;
var objectID = require('mongodb').ObjectID;

Evento = require("../model/Evento");

function returnCommonResponse(res, httpCode, json){
    res.status(httpCode);
    res.json(json);
    return res;
}

module.exports = function(app){
    
    //create event
    app.post("/event", function(req, res){
        console.log("create event - init");
        
        var eventDate = moment(req.body.date, "YYYY-MM-DD");
        
        if(!req.body.name || !req.body.description || !req.body.date 
                || !eventDate.isValid() || eventDate.isBefore(moment())){
                 
                        res = returnCommonResponse(res, 400, {
                            created: false,
                            message: "Detalles del evento incorrectos!"
                        });
                console.log("Detalles del evento incorrectos " + 
                        req.body.name,
                        req.body.description,
                        req.body.date);
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

                var collection = db.collection('events');

                var event = new Evento(
                        req.body.name,
                        req.body.description,
                        req.body.date);

                collection.insert(event, function (err, result) {
                    if (err) {
                        console.log("Error insertando Evento en BD " + err);
                        res = returnCommonResponse(res, 400, {
                            created: false,
                            message: "DB error"
                        });
                    } else {
                        console.log("Evento creado");
                        res = returnCommonResponse(res, 200, {
                            created: true,
                            message: "Evento creado satisfactoriamente",
                            details : JSON.stringify(result.ops[0])
                        });
                    }
                    db.close();
                });
            }
        });
        console.log("create event - end");
    });
    
    //Delete Event
    app.delete("/event", function(req, res){
        console.log("delete event - init");
        
        if(!req.body.id || !objectID.isValid(req.body.id)){
            res = returnCommonResponse(res, 400, {
                deleted: false,
                message: "Detalles del evento incorrectos!"
            });
            return this;
        }
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

                var collection = db.collection('events');
                var eventId = require('mongodb').ObjectID(req.body.id);

                collection.remove({_id : eventId}, function (err, response) {
                    if (err || response.result.n == 0) {
                        console.log("Error al eliminar Evento " + err);
                        res = returnCommonResponse(res, 400, {
                            deleted: false,
                            message: "Error eliminando evento"
                        });
                    } else {
                        console.log("Evento eliminado:");
                        res = returnCommonResponse(res, 410, {
                            deleted: true,
                            message: "Evento eliminado correctamente"
                        });
                    }
                    db.close();
                });
            }
        });
        console.log("delete event - end");
    });
    
    //Read Event
    app.get("/event/:id", function(req, res){
        console.log("getting event - init");
        
        if(!objectID.isValid(req.params.id)){
            res = returnCommonResponse(res, 400, {
                deleted: false,
                message: "Detalles del evento incorrectos!"
            });
            return this;
        }
        
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

                var collection = db.collection('events');
                var eventId = require('mongodb').ObjectID(req.params.id);
                
                collection.find({_id: eventId}).toArray(function(err, result){
                    console.log("result: " + result);
                    if(err){
                        console.log("Error buscando Evento en DB");
                        res = returnCommonResponse(res, 500, {
                            found: false,
                            message: "Error buscando evento en DB"
                        });
                    }else if(result.length == 0){
                        console.log("Evento no encontrado");
                        res = returnCommonResponse(res, 404, {
                            found: false,
                            message: "EventoID " + eventId + " no encontrado"
                        });
                    }else{
                        res = returnCommonResponse(res, 200, {
                            found: true,
                            message: "Evento encontrado",
                            details: result[0]
                        });
                    }
                    db.close();
                });
            }
        });
        console.log("getting event - end");
    });
    
    //Read Event
    app.get("/event", function(req, res){
        console.log("getting all events - init");
              
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

                var collection = db.collection('events');
                
                collection.find().toArray(function(err, result){
                    console.log("result: " + result);
                    if(err){
                        console.log("Error buscando Evento en DB");
                        res = returnCommonResponse(res, 500, {
                            found: false,
                            message: "Error buscando evento en DB"
                        });
                    }else{
                        res = returnCommonResponse(res, 200, {
                            found: true,
                            message: "Eventos encontrados",
                            details: result
                        });
                    }
                    db.close();
                });
            }
        });
        console.log("getting all events - end");
    });
}