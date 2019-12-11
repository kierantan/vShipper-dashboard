var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';

router.use(function (req,res,next) {
    console.log(req.method + " " + req.protocol + '://' + req.get('host') + req.originalUrl);
    next();
});

router.get("/",function(req,res){
    res.sendFile(path + "account_settings.html");
});

router.get("/login", function(req, res) {
    res.sendFile(path + "index.html");
});

router.get("/packages",function(req,res){
    res.sendFile(path + "my_packages.html");
});

router.get("/packages/new",function(req,res){
    res.sendFile(path + "add_package.html");
});

router.get("/packages/view/:packageId",function(req,res){
    res.sendFile(path + "view_package.html");
});

router.get("/packages/review",function(req,res){
    res.sendFile(path + "review_cart.html");
});

router.get("/packages/delivery", function(req, res) {
    res.sendFile(path + "delivery.html");
});

router.get("/packages/send/success", function(req, res) {
    res.sendFile(path + "success.html");
});

router.get("/settings", function(req, res) {
    res.sendFile(path + "account_settings.html");
});

router.get("/addresses/new", function(req, res) {
    res.sendFile(path + "add_address.html");
});

router.get("/packages/pay", function(req, res) {
    res.sendFile(path + "payment.html");
});

app.use("/",router);

app.use(express.static('views'));

app.use("*",function(req,res){
    res.sendFile(path + "404.html");
});

module.exports = app;