import { describe, beforeEach, afterEach, it, expect } from './jasmine.js';
import getReq from '@iml/req';
import fs from 'fs';

describe('srcmap-reverse-server integration test', () => {
  let trace, reversedFixture, server;

  beforeEach(() => {
    server = require('../dist/srcmap-reverse-server.js');
    trace = fs.readFileSync(`${__dirname}/fixtures/trace.txt`, 'utf8');

    reversedFixture = fs
      .readFileSync(`${__dirname}/fixtures/reversed-trace.txt`, 'utf8')
      .split('\n')
      .slice(0, -1)
      .join('\n');
  });

  afterEach(done => {
    server.close(err => {
      if (err) done.fail(err);
      else done();
    });
  });

  it('should return line and column numbers for each line in a minified stack trace', done => {
    getReq('http')
      .bufferJsonRequest({
        headers: {
          Connection: 'close'
        },
        method: 'POST',
        json: { trace },
        path: 'localhost',
        port: 8082
      })
      .each(x => {
        expect(x.body).toBe(reversedFixture);
      })
      .stopOnError(done.fail)
      .done(done);
  });

  describe('to test support for parellelized deminification', () => {
    let single, fixtureSingle;

    beforeEach(() => {
      single = trace.split('\n')[1];
      fixtureSingle = reversedFixture.split('\n')[0];
    });

    it('should return line and column numbers for a single minified line', (
      done: Function
    ) => {
      getReq('http')
        .bufferJsonRequest({
          headers: {
            Connection: 'close'
          },
          method: 'POST',
          json: { trace: single },
          path: 'localhost',
          port: 8082
        })
        .each(x => {
          expect(x.body).toEqual(fixtureSingle);
        })
        .stopOnError(done.fail)
        .done(done);
    });
  });
});