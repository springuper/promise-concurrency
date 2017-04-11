'use strict';

module.exports = function (promiseFactories, limit) {
    var len = promiseFactories.length;
    if (len === 0) {
        return Promise.reject(new Error('promise list is empty.'));
    }

    var results = new Array(len);
    var resolveAll;
    var rejectAll;
    var rejectReason = null;
    var promise = new Promise(function (resolve, reject) {
        resolveAll = resolve;
        rejectAll = reject;
    });

    var startup = promiseFactories.slice(0, limit);
    var queue = promiseFactories.slice(limit);
    var index = limit;
    var counter = 0;

    function release() {
        counter++;

        if (rejectReason) {
            // wait until all in progress promises finish if there is some promise fails
            if (counter === Math.min(len, Math.ceil(counter / limit) * limit)) {
                rejectAll(rejectReason);
            }
            return;
        }
        if (!rejectReason && counter === len) {
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
            rejectReason = reason;
            release();
        });
    }

    startup.forEach(run);

    return promise;
};
