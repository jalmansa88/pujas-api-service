var express = require('express');
//var jwt = require('jsonwebtoken');
var mongoAccess = require("mongodb").MongoClient;
//var bodyParser = require('body-parser');
const crypto = require('crypto');
const encryptionKey = '.!?jkasxLjs?';
var validateUserDetails = express.Router();
Usuario = require("../model/Usuario");

//var app = express();

//app.use(bodyParser());
//app.use("/user/:username", securePaths);

function returnCommonResponse(res, httpCode, json){
    res.status(httpCode);
    res.json(json);
    return res;
}

validateUserDetails.use(function(req, res, next){
    if(!req.body.username || !req.body.pass || !req.body.name){
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
    next();
});

module.exports = function(app){
    app.use(validateUserDetails);
    
    app.post("/user", function(req, res){
        console.log("create user - init");
//        return validateUserDetails(req, res);
//        if(!req.body.username || !req.body.pass || req.body.name){
//            res = returnCommonResponse(res, 400, {
//                created: false,
//                message: "Detalles del usuario no validos!"
//            });
//            console.log("Info de usuario incompleta " + 
//                    req.body.username,
//                    req.body.pass,
//                    req.body.name);
//            return this;
//        }

        mongoAccess.connect('mongodb://usuario:1234@ds123658.mlab.com:23658/masterunir',
        function(err, db) {
            if (err) {
                console.log("Error 300 conectando a la BD " + err);
                res = returnCommonResponse(res, 500, {
                    created: false,
                    message: "DB error 300"
                });
            } else {
                console.log("Conectado correctamente a MongoDB");

                var collection = db.collection('users');
                collection.find({username: req.body.username}).toArray(function(err, users){
                        if(err){
                            console.log("Error buscando user en DB");
                            res = returnCommonResponse(res, 500, {
                                created: false,
                                message: "Error buscando user en DB"
                            });
                            db.close();
                            return this;
                        }else if(users.length > 0){
                            res = returnCommonResponse(res, 203, {
                                created: false,
                                message: "Username ya en uso"
                            });
                            db.close();
                            console.log("Usuario en uso...closing db...");
                            return this;
                        }
                        db.close();
                    });

                var encryptedPass = crypto.createHmac('sha256', encryptionKey)
                        .update(req.body.pass).digest('hex');
                
                console.log("creating user...");
                var user = new Usuario(
                        req.body.username,
                        encryptedPass, 
                        req.body.name);

                collection.insert(user, function (err, users) {
                    if (err) {
                        console.log("Error 301 insertando en BD " + err);
                        res = returnCommonResponse(res, 400, {
                            created: false,
                            message: "DB error 301"
                        });
                    } else {
                        console.log("Usuario Creado");
                        res = returnCommonResponse(res, 200, {
                            created: true,
                            message: "Usuario creado satisfactoriamente"
                        });
                    }
                    db.close();
                });
            }
        });
        console.log("create user - end");
    });
}


