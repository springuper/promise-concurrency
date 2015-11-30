var assert = require('assert');
var Promise = require('es6-promise').Promise;
var promiseParallel = require('../lib/concurrency');

describe('PromiseParallel', function () {
    it('should execute promises in parallel', function (done) {
        var counter = 0;
        var sequence = [];
        var promiseFactories = [5, 1, 2, 3, 4].map(function (item) {
            return function () {
                return new Promise(function (resolve) {
                    counter++;
                    assert(counter <= 2);
                    setTimeout(function () {
                        counter--;
                        assert(counter >= 0);
                        sequence.push(item);
                        resolve(item);
                    }, item * 100);
                });
            };
        });
        promiseParallel(promiseFactories, 2).then(function (value) {
            assert.deepEqual(value, [5, 1, 2, 3, 4]);
            assert.deepEqual(sequence, [1, 2, 5, 3, 4]);
            done();
        }).catch(done);
    });

    it('should reject when promiseFactories is empty', function (done) {
        var promiseFactories = [];
        promiseParallel(promiseFactories, 2).catch(function (reason) {
            assert.equal(reason.message, 'promise list is empty.');
            done();
        });
    });
});
