var express = require("express");
var jwt = require('jsonwebtoken');
const crypto = require('crypto');
var mongoAccess = require("mongodb").MongoClient;

var app = express();

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

app.post("/user/create", function(req, res){
    //create new user
});

app.get("/", function(req, res){
   res.send("GET Works!");
});

app.listen(8080,
function(){
    console.log("Servidor express arrancado");
});