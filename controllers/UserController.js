var express = require('express');
var mongoAccess = require("mongodb").MongoClient;
const crypto = require('crypto');
const encryptionKey = '.!?jkasxLjs?';

Usuario = require("../model/Usuario");

function getDb(callback){
    mongoAccess.connect(
            'mongodb://usuario:1234@ds123658.mlab.com:23658/masterunir',
            function(err, db){
                if (err) return callback(err);
                
                var usersCollection = db.collection("users");
                callback(null, usersCollection); 
        });
}

function readAll(usersCollection, callback) {  
   usersCollection.find({}, cb);
}

function findByUsername(usersCollection, username, callback) {  
   usersCollection.find({username: username}, callback);
}

module.exports = function(app, securePaths){
    
    //Create User
    app.post("/user", function(req, res){
        console.log("create user - init");
        
        if(!req.body.username.trim() || !req.body.pass.trim() || !req.body.name.trim()){
            res = returnCommonResponse(res, 400, {
                created: false,
                message: "Detalles del usuario no validos!"
            });
            console.log("Info de usuario incompleta " + 
                    req.body.username,
                    req.body.pass,
                    req.body.name);
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

                var collection = db.collection('users');
                
                collection.find({username: req.body.username}).toArray(function(err, result){
                    if(err){
                        console.log("Error buscando user en DB");
                        res = returnCommonResponse(res, 500, {
                            created: false,
                            message: "Error buscando user en DB"
                        });
                        
                    }else if(result.length > 0){
                        res = returnCommonResponse(res, 203, {
                            created: false,
                            message: "Username no disponible",
                        });
                        console.log(req.body.username + " ya en uso");
                        
                    }else{
                        var encryptedPass = crypto.createHmac('sha256', encryptionKey)
                        .update(req.body.pass).digest('hex');
                
                        var user = new Usuario(
                                req.body.username,
                                encryptedPass, 
                                req.body.name);

                        collection.insert(user, function (err, result) {
                            if (err) {
                                console.log("Error insertando en BD " + err);
                                res = returnCommonResponse(res, 400, {
                                    created: false,
                                    message: "DB error"
                                });
                            } else {
                                console.log("Usuario Creado");
                                res = returnCommonResponse(res, 201, {
                                    created: true,
                                    message: "Usuario creado satisfactoriamente",
                                    details: JSON.stringify(result.ops[0])
                                });
                            }
                        });
                    }
                    db.close();
                });
            }
        });
        console.log("create user - end");
    });
    
    //Read User
    securePaths.get("/user/:username", function(req, res){
        console.log("getting event - init");
        
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

                var collection = db.collection('users');
                var userId = require('mongodb').ObjectID(req.params.id);
                
                collection.find({username: req.params.username}).toArray(function(err, result){
                    console.log("User found: " + JSON.stringify(result[0]));
                    if(err){
                        console.log("Error buscando Usuario en DB");
                        res = returnCommonResponse(res, 500, {
                            found: false,
                            message: "Error buscando usuario en DB"
                        });
                    }else if(result.length == 0){
                        console.log("Usuario no encontrado");
                        res = returnCommonResponse(res, 404, {
                            found: false,
                            message: "User con ID " + req.params.username + " no encontrado"
                        });
                    }else{
                        res = returnCommonResponse(res, 200, {
                            found: true,
                            message: "Usuario encontrado",
                            details: result[0]
                        });
                    }
                    db.close();
                });
            }
        });
        console.log("getting event - end");
    });
    
    // Update USER
    securePaths.patch("/user/:username", function(req, res){
        console.log("update user - init");

        if(!req.body.username.trim() || !req.body.pass.trim() || !req.body.name.trim()){
            res = returnCommonResponse(res, 400, {
                created: false,
                message: "Detalles del usuario no validos!"
            });
            console.log("Info de usuario incompleta " + 
                    req.body.username,
                    req.body.pass,
                    req.body.name);
            return this;
        }

        mongoAccess.connect('mongodb://usuario:1234@ds123658.mlab.com:23658/masterunir',
        function(err, db) {
            if (err) {
                console.log("Error conectando a la BD " + err);
                res = returnCommonResponse(res, 500, {
                    updated: false,
                    message: "DB error"
                });
            } else {
                console.log("Conectado correctamente a MongoDB");

                var collection = db.collection('users');

                var encryptedPass = crypto.createHmac('sha256', encryptionKey)
                        .update(req.body.pass).digest('hex');

                var user = new Usuario(
                        req.body.username,
                        encryptedPass, 
                        req.body.name);

                collection.update({username : req.params.username}, user, function (err, response) {
                    if (err) {
                        console.log("Error al actualizar usuario " + err);
                        res = returnCommonResponse(res, 400, {
                            updated: false,
                            message: "Error actualizando usuario"
                        });
                    }else if(response.result.n == 0){
                        console.log("Usuario no encontrado");
                        res = returnCommonResponse(res, 400, {
                            updated: false,
                            message: "Usuario no encontrado"
                        });
                    }else{
                        console.log("Usuario actualizado");
                        res = returnCommonResponse(res, 201, {
                            updated: true,
                            message: "Usuario actualizado"
                        });
                    }
                    db.close();
                });
            }
        });
        console.log("update user - end");
    });
    
    // Delete user
    securePaths.delete("/user/:username", function(req, res){
        console.log("delete user - init");

        mongoAccess.connect('mongodb://usuario:1234@ds123658.mlab.com:23658/masterunir',
        function(err, db) {
            if (err) {
                console.log("Error 300 conectando a la BD " + err);
                res = returnCommonResponse(res, 500, {
                    deleted: false,
                    message: "DB error 300"
                });
            } else {
                console.log("Conectado correctamente a MongoDB");

                var collection = db.collection('users');

                collection.remove({username : req.params.username}, function (err, response) {
                    if (err || response.result.n == 0) {
                        console.log("Error al eliminar usuario " + err);
                        res = returnCommonResponse(res, 400, {
                            deleted: false,
                            message: "Error eliminando usuario"
                        });
                    } else {
                        console.log("Usuario eliminado:");
                        res = returnCommonResponse(res, 410, {
                            deleted: true,
                            message: "Usuario eliminado"
                        });
                    }
                    db.close();
                });
            }
        });
        console.log("delete user - end");
    });
    
    app.use(securePaths);
};

function returnCommonResponse(res, httpCode, json){
    res.status(httpCode);
    res.json(json);
    return res;
}


