// @flow

import { describe, beforeEach, it, expect, jest } from './jasmine.js';

describe('src map reverse', () => {
  let mockBuildTraceCollection,
    mockSourceMapConsumer,
    smc,
    srcMap,
    srcMapReverse,
    trace,
    result;
  beforeEach(() => {
    smc = {
      originalPositionFor: jest
        .fn(() => 'originalPositionFor')
        .mockReturnValue({
          line: 50,
          column: 25,
          source: 'source',
          name: 'smcName'
        })
    };

    mockSourceMapConsumer = {
      SourceMapConsumer: jest
        .fn(() => 'SourceMapConsumer')
        .mockImplementation(() => {
          return smc;
        })
    };
    jest.mock('source-map', () => mockSourceMapConsumer);

    mockBuildTraceCollection = jest.fn(() => [
      {
        compiledLine: 'compiledLine',
        url: 'url',
        line: 50,
        column: 25
      }
    ]);

    // $FlowFixMe - traceItemRegex is indeed in buildTraceCollection
    mockBuildTraceCollection.traceItemRegex = /(http.+):(\d+):(\d+)/;

    jest.mock(
      '../source/build-trace-collection.js',
      () => mockBuildTraceCollection
    );

    srcMap = JSON.stringify({
      version: 1,
      file: 'file',
      sources: ['source1', 'source2'],
      names: ['name1', 'name2'],
      mappings: 'mappings',
      sourceRoot: 'sourceRoot',
      sourcesContent: ['content1', 'content2']
    });

    srcMapReverse = require('../source/srcmap-reverse.js').default;
    trace =
      'at Object.DashboardFilterCtrl.$scope.filter.onFilterView (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:38:7096)';

    result = srcMapReverse(srcMap, trace);
  });

  it('should instantiate SourceMapConsumer', () => {
    expect(mockSourceMapConsumer.SourceMapConsumer).toHaveBeenCalledWith(
      srcMap
    );
  });

  it('should call buildTraceCollection', () => {
    expect(mockBuildTraceCollection).toHaveBeenCalledWith(trace);
  });

  it('should call smc.originalPositionFor', () => {
    expect(smc.originalPositionFor).toHaveBeenCalledWith(
      {
        compiledLine: 'compiledLine',
        url: 'url',
        line: 50,
        column: 25
      },
      0,
      [{ column: 25, compiledLine: 'compiledLine', line: 50, url: 'url' }]
    );
  });

  it('should return the reversed trace', () => {
    expect(result).toBe('at smcName source:50:25');
  });
});
