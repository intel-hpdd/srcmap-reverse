// @flow

import {
  describe,
  beforeEach,
  it,
  expect
} from './jasmine.js';

import reverse from '../source/index.js';
import srcMap from './fixtures/built-fd5ce21b.js.map.json';
import fs from 'fs';

describe('srcmap-reverse integration test', () => {
  var trace, reversedFixture;

  beforeEach(() => {
    trace = fs
      .readFileSync(`${__dirname}/fixtures/trace.txt`, 'utf8');

    reversedFixture = fs
      .readFileSync(`${__dirname}/fixtures/reversed-trace.txt`, 'utf8')
      .split('\n')
      .slice(0, -1)
      .join('\n');
  });

  it('should return line and column numbers for each line in a minified stack trace', () => {
    expect(reverse(srcMap, trace))
      .toBe(reversedFixture);
  });

  describe('to test support for parellelized deminification', () => {
    var single, fixtureSingle;

    beforeEach(() => {
      single = trace
        .split('\n')[1];
      fixtureSingle = reversedFixture
        .split('\n')[0];
    });

    it('should return line and column numbers for a single minified line', () => {
      expect(reverse(srcMap, single))
        .toEqual(fixtureSingle);
    });
  });
});
