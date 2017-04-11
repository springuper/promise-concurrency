'use strict';

var assert = require('assert');
var promiseParallel = require('../lib/concurrency');

describe('PromiseParallel', function () {
    it('should execute promises in parallel', function (done) {
        var counter = 0;
        var sequence = [];
        var LIMIT = 2;
        var promiseFactories = [5, 1, 2, 3, 4].map(function (item) {
            return function () {
                return new Promise(function (resolve) {
                    counter++;
                    assert(counter <= LIMIT);
                    setTimeout(function () {
                        counter--;
                        assert(counter >= 0);
                        sequence.push(item);
                        resolve(item);
                    }, item * 100);
                });
            };
        });
        promiseParallel(promiseFactories, LIMIT).then(function (value) {
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

    it('should stop and reject when some promise fails', function (done) {
        var sequence = [];
        var LIMIT = 2;
        var promiseFactories = [1, 2, 3, 4, 5].map(function (item) {
            return function () {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        if (item === 3) {
                            reject('Wrong value.');
                        } else {
                            sequence.push(item);
                            resolve(item);
                        }
                    }, 100);
                });
            };
        });
        promiseParallel(promiseFactories, LIMIT).then(function () {
            throw new Error('Unexpected branch.');
        }, function (reason) {
            assert.deepEqual(reason, 'Wrong value.');
            assert.deepEqual(sequence, [1, 2, 4]);
            done();
        }).catch(done);
    });

    it('should reject only one time when multiple promises fail', function (done) {
        var sequence = [];
        var LIMIT = 2;
        var rejectCount = 0;
        var doneTimer = null;
        var promiseFactories = [1, 2, 3, 4, 5].map(function (item) {
            return function () {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        if (item === 3 || item === 4) {
                            reject('Wrong value.');
                        } else {
                            sequence.push(item);
                            resolve(item);
                        }
                    }, 100);
                });
            };
        });
        promiseParallel(promiseFactories, LIMIT).then(function () {
            throw new Error('Unexpected branch.');
        }, function (reason) {
            rejectCount++;
            assert.deepEqual(reason, 'Wrong value.');
            assert.deepEqual(sequence, [1, 2]);

            if (doneTimer) {
                clearTimeout(doneTimer);
            }
            doneTimer = setTimeout(function () {
                assert.equal(rejectCount, 1);
                done();
            }, 500);
        }).catch(done);
    });

    it('should reject when all in progress promises complete', function (done) {
        var sequence = [];
        var LIMIT = 2;
        var promiseFactories = [1, 2, 3, 4, 5].map(function (item) {
            return function () {
                return new Promise(function (resolve, reject) {
                    setTimeout(function () {
                        if (item === 3) {
                            reject('Wrong value.');
                        } else {
                            sequence.push(item);
                            resolve(item);
                        }
                    }, 100);
                });
            };
        });
        promiseParallel(promiseFactories, LIMIT).then(function () {
            throw new Error('Unexpected branch.');
        }, function (reason) {
            assert.deepEqual(reason, 'Wrong value.');
            assert.deepEqual(sequence, [1, 2, 4]);
            done();
        }).catch(done);
    });
});
