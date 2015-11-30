var Promise = require('es6-promise').Promise;

module.exports = function (promiseFactories, limit) {
    if (promiseFactories.length === 0) {
        return Promise.reject(new Error('promise list is empty.'));
    }

    var results = new Array(promiseFactories.length);
    var resolveAll;
    var promise = new Promise(function (resolve) {
        resolveAll = resolve;
    });

    var startup = promiseFactories.slice(0, limit);
    var queue = promiseFactories.slice(limit);
    var index = limit;
    var counter = 0;
    startup.forEach(function (promiseFactory, i) {
        promiseFactory().then(function (value) {
            results[i] = value;
            release();
        });
    });

    function release() {
        counter++;
        if (counter === promiseFactories.length) {
            return resolveAll(results);
        }

        if (queue.length) {
            var next = queue.shift();
            (function (i) {
                next().then(function (value) {
                    results[i] = value;
                    release();
                });
            })(index++);
        }
    }

    return promise;
};
