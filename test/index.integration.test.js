import { describe, beforeEach, it, expect } from './jasmine.js';
import fs from 'fs';
import path from 'path';
import request from './request.js';

xdescribe('srcmap-reverse-server integration test', () => {
  let trace, reversedFixture;

  beforeEach(() => {
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

  it('should return line and column numbers for each line in a minified stack trace', async () => {
    const result = await request(trace);
    expect(result).toBe(reversedFixture);
  });

  describe('to test support for parellelized deminification', () => {
    let single, fixtureSingle;

    beforeEach(() => {
      single = trace.split('\n')[1];
      fixtureSingle = reversedFixture.split('\n')[0];
    });

    it('should return line and column numbers for a single minified line', async () => {
      const result = await request(single);
      expect(result).toEqual(fixtureSingle);
    });
  });
});
