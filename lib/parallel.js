var Promise = require('es6-promise').Promise;

function chunk(arr, size) {
    var ret = [];
    var i, l;
    for (i = 0, l = arr.length; i < l; i += size) {
        ret.push(arr.slice(i, i + size));
    }
    return ret;
}

module.exports = function (promiseGenerators, limit) {
    var results = [];
    if (promiseGenerators.length === 0) {
        throw new Error('promise list is empty.');
    }

    var chunks = chunk(promiseGenerators, limit);
    var fn = function () {
        return Promise.all(chunks.shift().map(function (promiseGenerator) {
            return promiseGenerator();
        })).then(function (value) {
            results = results.concat(value);
            if (chunks.length === 0) {
                return Promise.resolve(results);
            }

            return fn();
        }).catch(function (reason) {
            throw reason;
        });
    };

    return fn();
};
