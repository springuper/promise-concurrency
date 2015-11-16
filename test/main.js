var assert = require('assert');
var Promise = require('es6-promise').Promise;
var promiseParallel = require('../lib/parallel');

describe('PromiseParallel', function () {
    it('should execute promises in parallel', function (done) {
        var counter = 0;
        var promiseWrappers = [5, 4, 3, 2, 1].map(function (item) {
            return function () {
                return new Promise(function (resolve, reject) {
                    counter++;
                    assert(counter <= 2);
                    setTimeout(function () {
                        counter--;
                        assert(counter >= 0);
                        resolve(item);
                    }, item * 100);
                });
            };
        });
        promiseParallel(promiseWrappers, 2).then(function (value) {
            assert.deepEqual(value, [5, 4, 3, 2, 1]);
            done();
        });
    });
});
