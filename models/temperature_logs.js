var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tlogSchema = new Schema({
    logger_name:  {
        type: String,
        required: true,
        maxlength: 15
    },
    humidity:  {
        type: Number,
        required: true
    },
    temperature_celsius:  {
        type: Number,
        required: true
    },
    heat_index_celsius:  {
        type: Number,
        required: true
    },
}, {
    timestamps: true
});

var TemperatureLogs = mongoose.model('TemperatureLog', tlogSchema);

module.exports = TemperatureLogs;