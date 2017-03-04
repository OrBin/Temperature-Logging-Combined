var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var dispLoggerSchema = new Schema({
    logger_name: {
        type: String,
        required: true,
        maxlength: 15
    },
    logger_display_name: {
        type: String,
        required: true,
        maxlength: 15
    },
    is_displayed: {
        type: Boolean,
        required: true,
        default: true
    },
    latest_log: {
        type: Schema.Types.ObjectId,
        required: true,
        default: null,
        ref: 'TemperatureLog'
    }
},
{
    timestamps: true
});

var DisplayedLogger = mongoose.model('DisplayedLogger', dispLoggerSchema);

module.exports = DisplayedLogger;