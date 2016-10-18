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

var hostname = '10.100.102.13';
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
app.use(favicon(path.join(__dirname, '/thermometer1.ico')));

app.get('/', function (req, res) {

    TemperatureLogs.aggregate([
        // Sort content by createdAt
        { "$sort": {
            "createdAt": -1
        }},

        // Group by logger_name and push all items
        { "$group": {
            "_id": "$logger",
            "results": {
                "$push": {
                    "logger": "$logger",
                    "humidity": "$humidity",
                    "temperature": "$temperature_celsius",
                    "heat_index": "$heat_index_celsius",
                    "log_time": "$createdAt"
                }
            }
        }},

        // Keep only one result of each group
        { "$project": {
            "results": {
                "$slice": [ "$results", 1 ]
            }
        }}
        ]).exec(function(err, data) {

            var mappedData = [].concat(data.map(function(element) {
                return element.results[0];
            }));

            DisplayedLoggers.populate(mappedData, {
                path: "logger",
                model: "DisplayedLogger"
            }, function(err, populatedData) {

                var displayableSensorsData = populatedData.filter(function(element) {
                    return element.logger.is_displayed;
                });

                res.render('main', {
                    sensors: displayableSensorsData
                });
            });
        });
    });

router.route('/log')
    .get(function (req, res, next) {
        // TODO iterative fetching
        TemperatureLogs.find({}).populate('logger').limit(10000).exec(function (err, tlog) {
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

