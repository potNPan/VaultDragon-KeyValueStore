const bodyParser = require('body-parser');
const express = require('express');
const mongoose = require('mongoose');

const MyKey = require('../models/myKey');
const KeyValueVersion = require('../models/keyValueVersion');

if (process.env.NODE_ENV == 'production') {
    // don't actually have a production environment for this purpose, so url is the same
    mongoose.connect('mongodb://vaultuser:passvault0301@ds113841.mlab.com:13841/vaultdragon');
} else {
    mongoose.connect('mongodb://vaultuser:passvault0301@ds113841.mlab.com:13841/vaultdragon');
}

mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();
app.use(bodyParser.json());

app.get('/object/:mykey', (req, res, next) => {
    const mykey = req.params.mykey;
    const timestamp = +req.query.timestamp;
    MyKey.findOne({key: mykey})
        .exec((err, mykey) => {
            if (err) {
                res.sendStatus(500);
                return console.log(err);
            } else {
                let query = KeyValueVersion.findOne({key: mykey._id});
                if (Number.isInteger(timestamp)) {
                    let datetime = new Date(timestamp);
                    query = query.where('timestamp').lte(datetime);
                }
                query
                    .sort('-timestamp')
                    .exec((err, version) => {
                        if (err) {
                            res.sendStatus(500);
                            return console.log(err);
                        } else {
                            if (!version) {
                                res.sendStatus(404);
                            } else {
                                let result = {
                                    value: version.value
                                };
                                res.json(result);
                            }
                        }
                    });
            }
        });
});

app.post('/object', (req, res, next) => {
    const body = req.body;
    let result;
    let keys = Object.keys(body);
    if (!body || keys.length != 1) {
        result = {error: 'missing or invalid JSON body'};
        res.json(result);
    } else {
        let key = keys[0];
        let value = body[key];
        try {
            MyKey.findOne({key: key})
                .exec((err, mykey) => {
                    if (err) {
                        res.sendStatus(500);
                        return console.log(err);
                    } else {
                        if (mykey == null) {
                            mykey = new MyKey({
                                key: key
                            });
                            mykey.save();
                        }
                        let version = new KeyValueVersion({
                            key: mykey._id,
                            value: value
                        });
                        version.save();
                        result = {
                            key: mykey.key,
                            value: version.value,
                            timestamp: version.timestamp.getTime()
                        };
                        res.json(result);
                    }
                });
        } catch (err) {
            console.log(err);
        }
    }
});

app.get('*', (req, res) => {
    res.sendStatus(404);
});

app.listen(3000);