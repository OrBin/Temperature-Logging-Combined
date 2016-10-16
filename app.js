var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var exphbs  = require('express-handlebars');
var moment = require('moment');

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
            return moment(timestamp).format("DD/MM/YY HH:mm");//new Date(timestamp).toString();
        }
    }

});

app.engine('handlebars', hbs.engine);//({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {

    DisplayedLoggers.find({
        //"is_displayed": true
    }).exec(function (err, enabled_loggers) {
        TemperatureLogs.aggregate([
            // Sort content by createdAt
            { "$sort": { "createdAt": -1 } },

            // Group by logger_name and push all items, keeping first result
            { "$match": {
                "logger_name": {
                    "$in": enabled_loggers.map(function(element) {
                        return element.logger_name;
                    })
                }
            }},
            { "$group": {
                "_id": "$logger_name",
                "results": {
                    "$push": {
                        "logger_name": "$logger_name",
                        "logger_display_name": "$logger_name",
                        "humidity": "$humidity",
                        "temperature": "$temperature_celsius",
                        "heat_index": "$heat_index_celsius",
                        "log_time": "$createdAt"
                    }
                }
            }},
            { "$project": {
                "results": {
                    "$slice": [ "$results", 1 ]
                }
            }}
        ]).exec(function(err, data) {

            var sensors_data = [].concat(data.map(function(element) {
                return element.results[0];
            }));

            res.render('main',
                { sensors: sensors_data });
        });
    });

});

/*router.route('/')
    .get(function (req, res, next) {
        res.render('home');
    });*/

router.route('/log')
    .get(function (req, res, next) {
        // TODO iterative fetching
        TemperatureLogs.find({}).limit(10000).exec(function (err, tlog) {
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
app.use(morgan('dev'));

app.use("/", router);
app.listen(port, hostname, function(){
    console.log(`Server running at http://${hostname}:${port}/`);
});

