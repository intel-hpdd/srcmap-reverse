// @flow

import { describe, beforeEach, it, expect, jest } from './jasmine.js';
import { Readable, Writable } from 'stream';

describe('srcmap-reverse unit test', () => {
  let arr,
    mockHttp,
    mockSourceMapConsumer,
    smc,
    server,
    mockBuildTraceCollection,
    trace,
    srcMap,
    output;

  beforeEach(done => {
    trace = `Error: Come on sourcemaps.
at Object.DashboardFilterCtrl.$scope.filter.onFilterView (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:38:7096)
at https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:14:4896
at https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:14:16407
at Scope.$eval (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:12:12643)
at Scope.$apply (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:12:12989)
at HTMLButtonElement.<anonymous> (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:14:16389)
at HTMLButtonElement.jQuery.event.dispatch (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:7:13226)
at HTMLButtonElement.elemData.handle (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:7:8056)
`;
    srcMap = {
      version: 1,
      file: 'file',
      sources: ['source1', 'source2'],
      names: ['name1', 'name2'],
      mappings: 'mappings',
      sourceRoot: 'sourceRoot',
      sourcesContent: ['content1', 'content2']
    };

    server = {
      close: jest.fn(() => 'close'),
      listen: jest.fn(() => 'listen')
    };

    mockHttp = {
      createServer: jest.fn(() => 'createServer').mockReturnValue(server)
    };
    jest.mock('http', () => mockHttp);

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

    mockBuildTraceCollection = jest
      .fn(() => 'buildTraceCollection')
      .mockReturnValue([
        {
          compiledLine: 'compiledLine',
          url: 'url',
          line: 50,
          column: 25
        }
      ]);

    jest.mock(
      '../source/build-trace-collection.js',
      () => mockBuildTraceCollection
    );

    const srcMapReverse = require('../source/index.js').default;

    srcMapReverse();

    const createServer = mockHttp.createServer.mock.calls[0][0];

    const request = new Readable({ objectMode: true });
    request.push('{ "srcMap": ');
    request.push(JSON.stringify(srcMap));
    request.push(', "trace');
    request.push(`": ${JSON.stringify(trace)}`);
    request.push('}');
    request.push(null);

    output = '';
    const response = new Writable({
      write: (chunk, encoding, next) => {
        output = output.concat(chunk.toString('utf8'));
        next();
      }
    });
    response.on('finish', done);

    createServer(request, response);
  });

  beforeEach(() => {
    arr = output.match(/(\d+):(\d+)/);
  });

  it('should start a server', () => {
    expect(mockHttp.createServer).toHaveBeenCalledTimes(1);
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
    expect(smc.originalPositionFor).toHaveBeenCalledWith({
      compiledLine: 'compiledLine',
      url: 'url',
      line: 50,
      column: 25
    });
  });

  it('should call server.listen with the specified port', () => {
    expect(server.listen).toHaveBeenCalledWith(8082);
  });

  it('should produce a source code location.', () => {
    expect(output.indexOf('source:50:25') !== -1).toBe(true);
  });

  it('should produce a source code location with a line number.', () => {
    const lineNumber = arr ? arr[1] : '';
    expect(lineNumber).toBe('50');
  });

  it('should produce a source code location with a column number.', () => {
    const columnNumber = arr ? arr[2] : '';
    expect(columnNumber).toBe('25');
  });
});
