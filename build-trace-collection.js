'use strict';

module.exports = function buildTraceCollection (xs) {
  var traceItemRegex = /(http.+):(\d+):(\d+)/;

  return xs
    .split('\n')
    .map(traceItemRegex.exec.bind(traceItemRegex))
    .filter(function filter (x) {
      return x != null;
    })
    .map(function buildMatchObject (xs) {
      return {
        compiledLine: xs[0],
        url: xs[1],
        line: parseInt(xs[2], 10),
        column: parseInt(xs[3], 10)
      };
    });
};
