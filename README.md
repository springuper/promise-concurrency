# promise-parallel

[![Build Status](https://travis-ci.org/springuper/promise-parallel.svg?branch=master)](https://travis-ci.org/springuper/promise-parallel)

run promises in parallel with a concurrency limit.

## Installation

```
npm install promise-parallel
```

## Example

The most common use case:

```js
var promiseGenerators = [5, 4, 3, 2, 1].map(function (item) {
    return function () {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(item);
            }, item * 100);
        });
    };
});
promiseParallel(promiseGenerators, 2).then(function (value) {
    console.log(value); // => [5, 4, 3, 2, 1]
});
```
