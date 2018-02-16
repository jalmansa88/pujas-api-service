var express = require("express");
var jwt = require('jsonwebtoken');
var mongoAccess = require("mongodb").MongoClient;
var bodyParser = require('body-parser');
var securePaths = express.Router();

var app = express();

const crypto = require('crypto');
const encryptionKey = '.!?jkasxLjs?';

app.use(bodyParser());

function Usuario(username, pass, name){
    this.username = username;
    this.pass = pass;
    this.name = name;
}

function Puja(username, amount, event){
    this.username = username;
    this.amount = amount;
    this.evento = evento;
}

function Evento(name, description){
    this.name = name;
    this.description = description;
}

function returnCommonResponse(res, httpCode, json){
    res.status(httpCode);
    res.json(json);
    return res;
}

function userParams(username, pass, name){
    return (username || pass || name);
}
//
//function findUserByUsername(username, response){
//    mongoAccess.connect('mongodb://usuario:1234@ds123658.mlab.com:23658/masterunir',  
//        function(err, db){
//            if (err) {
//                console.log("Error conectando a la BD " + err);
//            } else {
//                var collection = db.collection('users');
//                collection.find({username: username}).toArray(function(err, users){
//                    if(!err && users.length == 0){
//                        console.log("Usuario no encontrado " + users);
//                    }else{
//                        console.log("error o usuario ya existente");
//                        console.log("user AQUI" + users);
//                        response.users = users;
//                    }
//                });
//                db.close();
//            } 
//    })
//}

app.post("/user/register", function(req, res){
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
    
//    var response = findUserByUsername(req.body, response);
//    if (users.length){
//        res = returnCommonResponse(res, 400, {
//            created: false,
//            message: "Usuario en uso!"
//        });
//        console.log("Username ya en uso");
//        return this; 
//    }
    
    mongoAccess.connect('mongodb://usuario:1234@ds123658.mlab.com:23658/masterunir',
    function(err, db) {
        if (err) {
            console.log("Error 300 conectando a la BD " + err);
            res = returnCommonResponse(res, 500, {
                created: false,
                message: "DB error 300"
            });
        } else {
            console.log("Conectado correctamente a MongoDB")
            
            var encryptedPass = crypto.createHmac('sha256', encrypttionKey)
                    .update(req.body.pass).digest('hex');
            
            var user = new Usuario(
                    req.body.username,
                    encryptedPass, 
                    req.body.name);

            var collection = db.collection('users');
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

app.post("/user/auth", function(req, res){
    console.log("auth user - init");
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
                            console.log("Error leyendo usuario de BD " + err);
                            res = returnCommonResponse(res, 400, {
                                auth: false,
                                message: "DB error"
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
            if(err || (date.now()/1000 - resToken.timestamp) > 60){
                return res.json({
                    access : false,
                    message : "Token invalido o expirado"
                });
            }else{
                console.log("Usuario: " + resToken.username);
                console.log("Activo " + (Date.now()/1000 - infoToken.timestamp) + " segundos");
                res.username = resToken.username;
                next();
            }
        })
    }else{
        res = returnCommonResponse(res, 403, {
            access: false,
            message: "No se encontrado token",
        });
    }
});

app.use("/", securePaths);
app.get("/", function(req, res){
   res.send("GET Works!");
});

app.listen(8080,
function(){
    console.log("Servidor express arrancado");
});