'use strict';

var reverse = require('../index');
var readFile = require('fs').readFile;
var srcMap = require('./fixtures/built-fd5ce21b.js.map.json');
var λ = require('highland');

var handleDone = λ.curry(function handleDone (done, fn, err, x) {
  if (err) {
    done.fail(err);
  } else {
    fn(err, x);
    done();
  }
});

describe('srcmap-reverse integration test', function () {
  var trace, reversedFixture;

  beforeEach(function getTrace (done) {
    readFile(__dirname + '/fixtures/trace.txt', 'utf8', handleDone(done, function assign (err, x) {
      trace = x;
    }));
  });

  beforeEach(function getExpectedFile (done) {
    readFile(__dirname + '/fixtures/reversed-trace.txt', 'utf8', handleDone(done, function assign (err, x) {
      reversedFixture = x;
    }));
  });

  it('should return line and column numbers for each line in a minified stack trace', function () {
    expect(reverse(srcMap, trace)).toBe(reversedFixture);
  });

  describe('to test support for parellelized deminification', function () {
    var single, fixtureSingle;

    beforeEach(function () {
      single = trace.split('\n')[1];
      fixtureSingle = reversedFixture.split('\n')[0] + '\n';
    });

    it('should return line and column numbers for a single minified line', function () {
      expect(reverse(srcMap, single)).toEqual(fixtureSingle);
    });
  });
});
