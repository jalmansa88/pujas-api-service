var express = require('express');
var jwt = require('jsonwebtoken');
var mongoAccess = require("mongodb").MongoClient;
var bodyParser = require('body-parser');
var securePaths = express.Router();
const encryptionKey = '.!?jkasxLjs?';

var Usuario = require("./model/Usuario");
var Evento = require("./model/Evento");
var Puja = require("./model/Puja");

var userController = require('./controllers/UserController');
var pujaController = require('./controllers/PujaController');
var eventoController = require('./controllers/EventoController');
var authController = require('./controllers/AuthController');

var app = express();
app.use(bodyParser());
app.use("/bid", securePaths);

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

pujaController(app);
eventoController(app);
authController(app);
userController(app, securePaths);


app.get("/", function(req, res){
   res.send("GET Works!");
});

app.listen(8080, function(){
    console.log("Servidor express ON en 8080");
});

function returnCommonResponse(res, httpCode, json){
    res.status(httpCode);
    res.json(json);
    return res;
}