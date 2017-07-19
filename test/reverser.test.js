// @flow

import { describe, beforeEach, it, expect, jest } from './jasmine.js';
import { Readable } from 'stream';
import highland from 'highland';

const reversedLine =
  'at /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/iml/dashboard/dashboard-filter-controller.js:161:14';

describe('reverser', () => {
  let mockSrcMapReverse, mockFs, sourceMapStream, reverser, spy;

  beforeEach(done => {
    spy = jest.fn(() => 'spy');
    mockSrcMapReverse = jest.fn(() => reversedLine);
    jest.mock('../source/srcmap-reverse.js', () => mockSrcMapReverse);

    sourceMapStream = new Readable({ objectMode: true });
    sourceMapStream.push('source-maps');
    sourceMapStream.push(null);

    mockFs = {
      createReadStream: jest.fn(() => sourceMapStream)
    };
    jest.mock('fs', () => mockFs);

    reverser = require('../source/reverser.js').default;

    reverser('test/fixtures/built-fd5ce21b.js.map.json')(
      highland([
        'at Object.DashboardFilterCtrl.$scope.filter.onFilterView (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:38:7096)'
      ])
    ).each(x => {
      spy(x);
      done();
    });
  });

  it('should call createReadStream', () => {
    const sourceMapPath: string = mockFs.createReadStream.mock.calls[0][0];
    expect(
      sourceMapPath.indexOf('test/fixtures/built-fd5ce21b.js.map.json')
    ).toBeGreaterThan(-1);
  });

  it('should call srcmapReverse', () => {
    expect(mockSrcMapReverse).toHaveBeenCalledWith(
      'source-maps',
      'at Object.DashboardFilterCtrl.$scope.filter.onFilterView (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:38:7096)'
    );
  });

  it('should return the reversed line', () => {
    expect(spy).toHaveBeenCalledWith(reversedLine);
  });
});
