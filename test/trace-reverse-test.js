// @flow

import {
  describe,
  beforeEach,
  it,
  expect
} from './jasmine.js';

import reverse from '../source/index.js';
import buildTraceCollection from '../source/build-trace-collection.js';
import fs from 'fs';

import srcMap from './fixtures/built-fd5ce21b.js.map.json';

describe('srcmap-reverse unit test', () => {
  let srcCodeLocation, arr;

  beforeEach(() => {
    const trace = fs
      .readFileSync(`${__dirname}/fixtures/trace.txt`, 'utf8');
    const traceCollection = buildTraceCollection(trace);

    srcCodeLocation = reverse(srcMap, traceCollection[0].compiledLine);
    arr = srcCodeLocation.match(/(\d+):(\d+)/);
  });

  it('should produce a source code location.', () => {
    expect(srcCodeLocation.indexOf('dashboard/dashboard-filter-controller.js:161:14') !== -1)
      .toBe(true);
  });

  it('should produce a source code location with a line number.', () => {
    expect(arr[1])
      .toBe('161');
  });

  it('should produce a source code location with a column number.', () => {
    expect(arr[2])
      .toBe('14');
  });
});
