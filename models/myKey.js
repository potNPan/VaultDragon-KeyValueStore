const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const MyKeySchema = new Schema({
    key: { type: String, required: true },
    values: [{ type: Schema.Types.ObjectId, ref: 'KeyValueVersion' }],
});

module.exports = mongoose.model('MyKey', MyKeySchema);