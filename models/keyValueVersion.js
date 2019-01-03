const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const KeyValueVersionSchema = new Schema({
    key: { type: Schema.Types.ObjectId, ref: 'MyKey', required: true },
    value: { type: Object, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('KeyValueVersion', KeyValueVersionSchema);