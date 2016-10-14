var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var TemperatureLogs = require('./models/temperature_logs');

var hostname = 'localhost';
var port = 8081;

// TODO Connect to DB

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

