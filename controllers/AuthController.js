const crypto = require('crypto');
const encryptionKey = '.!?jkasxLjs?';
var jwt = require('jsonwebtoken');
var mongoAccess = require("mongodb").MongoClient;

module.exports = function(app){
    
    //AuthToken generator
    app.post("/auth", function(req, res){
        console.log("auth user - init");
        if(!req.body.username || !req.body.pass){
            res = returnCommonResponse(res, 400, {
                auth: false,
                message: "Detalles del usuario no validos!"
            });
            console.log("Info de usuario incompleta " + 
                    req.body.username,
                    req.body.pass);
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
                                    message: "Auth Correcto",
                                    authToken: authToken
                                });
                            }
                        db.close();
                });
            }
        });
        console.log("auth user - end");
    });
};

function returnCommonResponse(res, httpCode, json){
    res.status(httpCode);
    res.json(json);
    return res;
}

