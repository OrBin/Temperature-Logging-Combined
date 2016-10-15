var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var TemperatureLogs = require('./models/temperature_logs');

var hostname = 'localhost';
var port = 8082;
var mongoUrl = 'mongodb://localhost:27017/temperature_logs'

mongoose.connect(mongoUrl);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB server");
});

var app = express();
var router = express.Router();

router.use(bodyParser.json());

router.route('/')
    .get(function (req, res, next) {

    });

router.route('/log')
    .get(function (req, res, next) {
        TemperatureLogs.find({}, function (err, tlog) {
            if (err) throw err;
            res.json(tlog);
        });

    })
    .post(function (req, res, next) {
        // The received log time should be in milliseconds since epoch
        TemperatureLogs.create(req.body, function (err, tlog) {
            if (err) throw err;
            console.log('Temperature Log created!');
            var id = tlog._id;

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the log with id: ' + id);
        });

    });

app.use(morgan('dev'));

app.use("/", router);
app.listen(port, hostname, function(){
    console.log(`Server running at http://${hostname}:${port}/`);
});

