var express = require('express');
var jwt = require('jsonwebtoken');
var mongoAccess = require("mongodb").MongoClient;
var bodyParser = require('body-parser');
var securePaths = express.Router();
const crypto = require('crypto');
const encryptionKey = '.!?jkasxLjs?';

var Usuario = require("./model/Usuario");
var Evento = require("./model/Evento");
var Puja = require("./model/Puja");

var app = express();
var userController = require('./controllers/userController');

app.use(bodyParser());
app.use("/user/:username", securePaths);

//userController(app);

function returnCommonResponse(res, httpCode, json){
    res.status(httpCode);
    res.json(json);
    return res;
}

function userParams(username, pass, name){
    return (username || pass || name);
}

app.post("/user", function(req, res){
    console.log("create user - init");
    if(!userParams(req.body.username, req.body.pass, req.body.name)){
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
            collection.find({username: req.body.username}).toArray(function(err, users){
                    if(err){
                        console.log("Error conectando a la DB");
                        res = returnCommonResponse(res, 500, {
                            created: false,
                            message: "Error de conexión con la DB"
                        });
                        db.close();
                        return this;
                    }else if(users.length > 0){
                        res = returnCommonResponse(res, 203, {
                            created: false,
                            message: "Username ya en uso"
                        });
                        db.close();
                        return this;
                    }       
            });
            
            var encryptedPass = crypto.createHmac('sha256', encryptionKey)
                            .update(req.body.pass).digest('hex');

            var user = new Usuario(
                    req.body.username,
                    encryptedPass, 
                    req.body.name);

            collection.insert(user, function (err, users) {
                if (err) {
                    console.log("Error insertando en BD " + err);
                    res = returnCommonResponse(res, 400, {
                        created: false,
                        message: "DB error"
                    });
                } else {
                    console.log("Usuario Creado");
                    res = returnCommonResponse(res, 200, {
                        created: true,
                        message: "Usuario creado satisfactoriamente"
                    });
                }
            });
        }
    });
    console.log("create user - end");
});

app.patch("/user/:username", function(req, res){
    console.log("update user - init");
    
    if(!userParams(req.body.username, req.body.pass, req.body.name)){
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
                if (err || response.result.n == 0) {
                    console.log("Error al actualizar usuario " + err);
                    res = returnCommonResponse(res, 400, {
                        updated: false,
                        message: "Error actualizando usuario"
                    });
                } else {
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

app.delete("/user/:username", function(req, res){
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

app.post("/auth", function(req, res){
    console.log("auth user - init");
    if(!userParams(req.body.username, req.body.pass, req.body.name)){
        res = returnCommonResponse(res, 400, {
            auth: false,
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
                auth: false,
                message: "DB error"
            });
        } else {
            console.log("Conectado correctamente a MongoDB")
            
            var encryptedPass = crypto.createHmac('sha256', encryptionKey)
                    .update(req.body.pass).digest('hex');

            var collection = db.collection('users');
            collection.find({username : req.body.username, pass : encryptedPass})
                    .toArray(function (err, user) {
                        if (err || user.length == 0) {
                            console.log("Auth incorrecto");
                            res = returnCommonResponse(res, 400, {
                                auth: false,
                                message: "Auth incorrecto"
                            });
                        } else {
                            console.log("Auth correcto para el usuario " + user[0].username);
                            var authToken = jwt.sign(
                                    {username : user[0].username, timestamp : Date.now()/1000},
                                    encryptionKey);
                            res = returnCommonResponse(res, 200, {
                                auth: true,
                                message: "Auth correcto",
                                authToken: authToken
                            });
                        }
                    db.close();
            });
        }
    });
    console.log("auth user - end");
});

securePaths.use(function(req, res, next){
    var authToken = req.body.authToken || req.query.authToken || req.get('authToken');
    console.log("AuthToken: " + authToken);
    
    if(authToken){
        jwt.verify(authToken, encryptionKey, function(err, resToken){
            if(err || (Date.now()/1000 - resToken.timestamp) > 60){
                return res = returnCommonResponse(res, 403, {
                        access: true,
                        message: "Token invalido o expirado",
                    });
            }else{
                console.log("Usuario: " + resToken.username);
                console.log("Activo " + (Date.now()/1000 - resToken.timestamp) + " segundos");
                res.username = resToken.username;
                next();
            }
        })
    }else{
        res = returnCommonResponse(res, 400, {
            access: false,
            message: "No se encontrado token",
        });
    }
});

app.get("/", function(req, res){
   res.send("GET Works!");
});

app.listen(8080, function(){
    console.log("Servidor express arrancado");
});