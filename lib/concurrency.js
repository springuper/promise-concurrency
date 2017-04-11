'use strict';

module.exports = function (promiseFactories, limit) {
    if (promiseFactories.length === 0) {
        return Promise.reject(new Error('promise list is empty.'));
    }

    var results = new Array(promiseFactories.length);
    var resolveAll;
    var rejectAll;
    var hasRejected = false;
    var promise = new Promise(function (resolve, reject) {
        resolveAll = resolve;
        rejectAll = reject;
    });

    var startup = promiseFactories.slice(0, limit);
    var queue = promiseFactories.slice(limit);
    var index = limit;
    var counter = 0;
    startup.forEach(run);

    function release() {
        counter++;
        if (counter === promiseFactories.length) {
            resolveAll(results);
            return;
        }
        if (queue.length) {
            run(queue.shift(), index++);
        }
    }

    function run(factory, index) {
        factory().then(function (value) {
            results[index] = value;
            release();
        }, function (reason) {
            if (!hasRejected) {
                hasRejected = true;
                rejectAll(reason);
            }
        });
    }

    return promise;
};
