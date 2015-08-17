'use strict';

var reverse = require('../index');
var λ = require('highland');
var fs = require('fs');
var readFile = fs.readFile;
var buildTraceCollection = require('../build-trace-collection');
var srcMap = require('./fixtures/built-fd5ce21b.js.map.json');

var handleDone = λ.curry(function handleDone (done, fn, err, x) {
  if (err) {
    done.fail(err);
  } else {
    fn(err, x);
    done();
  }
});

describe('srcmap-reverse unit test', function () {

  var reversedFixture, traceCollection, srcCodeLocation, arr;

  beforeEach(function (done) {
    λ(fs.createReadStream(__dirname + '/fixtures/trace.txt', { encoding: 'utf8', objectMode: true }))
      .flatMap(buildTraceCollection)
      .stopOnError(done.fail)
      .collect()
      .map(function assign (x) {
        traceCollection = x;
      })
      .each(done);
  });

  beforeEach(function (done) {
    readFile(__dirname + '/fixtures/reversed-trace.txt', 'utf8', handleDone(done, function assign (err, x) {
      reversedFixture = x;
    }));
  });

  beforeEach(function (done) {
    var reverser = reverse(srcMap);

    λ([reverser(traceCollection[0].compiledLine)])
      .stopOnError(done.fail)
      .map(function (x) {
        srcCodeLocation = x;
        arr = x.match(/(\d+):(\d+)/);
      })
      .each(done);
  });

  it('should produce a source code location.', function () {
    expect(srcCodeLocation.indexOf('dashboard/dashboard-filter-controller.js:161:14') !== -1).toBe(true);
  });

  it('should produce a source code location with a line  number.', function () {
    expect(arr[1]).toBe('161');
  });

  it('should produce a source code location with a column number.', function () {
    expect(arr[2]).toBe('14');
  });
});
