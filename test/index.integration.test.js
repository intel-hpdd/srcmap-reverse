import { describe, beforeEach, afterEach, it, expect } from './jasmine.js';
import getReq from '@iml/req';
import fs from 'fs';
import path from 'path';
import serverProcess from 'child_process';

describe('srcmap-reverse-server integration test', () => {
  let server, trace, reversedFixture;

  beforeEach(done => {
    server = serverProcess.fork(
      `${path.join(__dirname, '..', 'dist', 'srcmap-reverse.js')}`,
      {
        stdio: 'inherit',
        shell: true
      }
    );

    server.on('message', x => {
      if (x.setup) done();
    });

    trace = fs.readFileSync(
      path.join(__dirname, 'fixtures', 'trace.txt'),
      'utf8'
    );
    reversedFixture = fs
      .readFileSync(
        path.join(__dirname, 'fixtures', 'reversed-trace.txt'),
        'utf8'
      )
      .split('\n')
      .slice(0, -1)
      .join('\n');
  });

  afterEach(done => {
    server.once('close', () => done());
    server.kill();
  });

  it('should return line and column numbers for each line in a minified stack trace', done => {
    getReq('http')
      .bufferJsonRequest({
        headers: {
          Connection: 'close'
        },
        method: 'POST',
        json: {
          trace: trace
        },
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
