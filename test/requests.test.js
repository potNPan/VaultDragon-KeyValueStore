const request = require('request');

const server = 'http://localhost:3000';

function randStr() {
    // modified from this: https://stackoverflow.com/a/19964557/675194
    const result = ((Math.random().toString(36))+'00000000000000000').substr(2, 12);
    return result;
}

let randKey1 = randStr();
let randVal1 = randStr();
let randKey2 = randStr();
let randVal2 = randStr();
console.log('randKey1: ' + randKey1);
console.log('randKey2: ' + randKey2);
console.log('randVal1: ' + randVal1);
console.log('randVal2: ' + randVal2);

test('POST with key randKey1, value randVal1', done => {
    expect.assertions(4);
    let reqBody = {};
    reqBody[randKey1] = randVal1;
    request.post(
        server + '/object',
        { json: reqBody },
        (err, res, body) => {
            expect(body).toBeInstanceOf(Object);
            expect(body.key).toBe(randKey1);
            expect(body.value).toBe(randVal1);
            expect(body.timestamp).toBeDefined();
            done();
        }
    );
});

test('GET with key randKey1', done => {
    expect.assertions(1);
    request.get(
        server + '/object/' + randKey1,
        (err, res, body) => {
            let obj = JSON.parse(body);
            expect(obj.value).toBe(randVal1);
            done();
        }
    );
});

/*
some delay here because otherwise the last test below (GET with
timestamp) will be requesting with timestamp before the first POST
*/
let beforeVal2;
setTimeout(() => {
    beforeVal2 = (new Date()).getTime();
}, 1000);  


test('POST again with key randKey1, value randVal2', done => {
    expect.assertions(4);
    setTimeout(() => {
        let reqBody = {};
        reqBody[randKey1] = randVal2;
        request.post(
            server + '/object',
            { json: reqBody },
            (err, res, body) => {
                expect(body).toBeInstanceOf(Object);
                expect(body.key).toBe(randKey1);
                expect(body.value).toBe(randVal2);
                expect(body.timestamp).toBeDefined();
                done();
            }
        );
    }, 1000);
});

test('GET with key randKey1 again', done => {
    expect.assertions(1);
    request.get(
        server + '/object/' + randKey1,
        (err, res, body) => {
            let obj = JSON.parse(body);
            expect(obj.value).toBe(randVal2);
            done();
        }
    );
});

test('GET with key randKey1, timestamp before second POST', done => {
    expect.assertions(1);
    request.get(
        server + '/object/' + randKey1 + '?timestamp=' + (beforeVal2 - 1),
        (err, res, body) => {
            let obj = JSON.parse(body);
            expect(obj.value).toBe(randVal1);
            done();
        }
    );
});