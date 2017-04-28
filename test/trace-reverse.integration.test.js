// @flow

import { describe, beforeEach, afterEach, it, expect } from './jasmine.js';

import reverse from '../source/index.js';
import srcMap from './fixtures/built-fd5ce21b.js.map.json';
import getReq from '@mfl/req';
import fs from 'fs';

describe('srcmap-reverse integration test', () => {
  let trace, reversedFixture, server;

  beforeEach(() => {
    server = reverse();
    trace = fs.readFileSync(`${__dirname}/fixtures/trace.txt`, 'utf8');

    reversedFixture = fs
      .readFileSync(`${__dirname}/fixtures/reversed-trace.txt`, 'utf8')
      .split('\n')
      .slice(0, -1)
      .join('\n');
  });

  afterEach((done: Function) => {
    server.close(err => {
      if (err) done.fail(err);
      else done();
    });
  });

  it('should return line and column numbers for each line in a minified stack trace', (
    done: Function
  ) => {
    getReq('http')
      .bufferJsonRequest({
        headers: {
          Connection: 'close'
        },
        method: 'POST',
        json: { srcMap, trace },
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
          json: { srcMap, trace: single },
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