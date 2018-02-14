var express = require("express");
var app = express();

var jwt = require('jsonwebtoken');

const crypto = require('crypto');

var mongoAccess = require("mongodb").MongoClient;

app.listen(8080,
function(){
    console.log("Servidor express arrancado");
});