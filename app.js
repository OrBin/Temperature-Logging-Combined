var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var exphbs  = require('express-handlebars');
var moment = require('moment');
var favicon = require('serve-favicon');
var path = require('path');

var TemperatureLogs = require('./models/temperature_logs');
var DisplayedLoggers = require('./models/displayed_loggers');

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

var hbs = exphbs.create({
    helpers: {
        formatDate: function(timestamp) {
            return moment(timestamp).format("DD/MM/YY HH:mm");
        }
    }
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(morgan('dev'));

// Icon made by Freepik from www.flaticon.com
app.use(favicon(path.join(__dirname, 'thermometer1.ico')));

app.use(express.static('public'));

app.get('/', function (req, res) {

    DisplayedLoggers.find({"is_displayed": true}).populate('latest_log')
                    .sort({"_id": 1}).exec(function (err, results) {

        if (err) throw err;
        res.render('main', {
            sensors: results
        });

    });
});

router.route('/log')
    .get(function (req, res, next) {
        // TODO iterative fetching
        TemperatureLogs.find({}).populate('logger').limit(100).exec(function (err, tlog) {
            if (err) throw err;
            res.json(tlog);
        });

    })
    .post(function (req, res, next) {
        // The received log time should be in milliseconds since epoch
        TemperatureLogs.create(req.body, function (err, tlog) {
            if (err) throw err;
            console.log('Temperature Log created!');

            DisplayedLoggers.findByIdAndUpdate(req.body.logger,
                {
                    $set: {
                        "latest_log": tlog._id
                    }
                },
                function (err, dlogger) {
                    if (err) throw err;
                    console.log('Logger updated!');

                    res.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Added the log with id: ' + tlog._id);
                });
        });
    });

router.route('/loggers')
    .get(function (req, res, next) {
        DisplayedLoggers.find({}).exec(function (err, dispLogger) {
            if (err) throw err;
            res.json(dispLogger);
        });

    })
    .post(function (req, res, next) {
        // The received log time should be in milliseconds since epoch
        DisplayedLoggers.create(req.body, function (err, dispLogger) {
            if (err) throw err;
            console.log('New displayed loggers created!');
            var id = dispLogger._id;

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('Added the logger with id: ' + id);
        });
    });

router.route('/loggers/:loggerId')
    .get(function (req, res, next) {
        DisplayedLoggers.findById(req.params.loggerId, function (err, promo) {
            if (err) throw err;
            res.json(promo);
        });
    })
    .put(function (req, res, next) {
        DisplayedLoggers.findByIdAndUpdate(req.params.loggerId, {
            $set: req.body
        }, {
            new: true
        }, function (err, logger) {
            if (err)
                throw err;
            res.json(logger);
        });
    })
    .delete(function (req, res, next) {
        DisplayedLoggers.findByIdAndRemove(req.params.loggerId, function (err, resp)
        {
            if (err)
                throw err;
            res.json(resp);
        });
    });

app.use("/", router);
app.listen(port, hostname, function(){
    console.log(`Server running at http://${hostname}:${port}/`);
});

