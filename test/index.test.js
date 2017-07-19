// @flow

import { describe, beforeEach, it, expect, jest } from './jasmine.js';
import { Readable, Writable } from 'stream';
import highland from 'highland';

const line =
  'at /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/iml/dashboard/dashboard-filter-controller.js:161:14';
const srcmapFile = '/tmp/built-fd5ce21b.js.map.json';

describe('srcmap-reverse-server unit test', () => {
  let arr,
    mockHttp,
    server,
    trace,
    reversedTrace,
    mockReverseInParallel,
    mockCluster,
    output;

  beforeEach(() => {
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
    reversedTrace = `at /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/iml/dashboard/dashboard-filter-controller.js:161:14
at apply /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/angular/angular.js:10795:20
at fn /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/angular/angular.js:19036:16
at this /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/angular/angular.js:12632:28
at $eval /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/angular/angular.js:12730:22
at $apply /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/angular/angular.js:19035:20
at apply /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/jquery/jquery.js:4371:8
at apply /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/jquery/jquery.js:4057:27`;

    process.env.SRCMAP_REVERSE_FD = '3';

    server = {
      listen: jest.fn(() => 'listen')
    };

    mockHttp = {
      createServer: jest.fn(() => server)
    };
    jest.mock('http', () => mockHttp);

    mockReverseInParallel = jest.fn(() => highland([reversedTrace]));

    jest.mock('../source/reverse-in-parallel', () => mockReverseInParallel);
  });

  describe('master', () => {
    beforeEach(done => {
      mockCluster = {
        isMaster: true
      };

      jest.mock('cluster', () => mockCluster);

      require('../source/index.js');

      const createServer = mockHttp.createServer.mock.calls[0][0];

      const request = new Readable({ objectMode: true });
      request.push('{ "trace');
      request.push(`": ${JSON.stringify(trace)},`);
      request.push(`"srcmapFile": "${srcmapFile}"`);
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

    it('should call server.listen with the specified port', () => {
      expect(server.listen).toHaveBeenCalledWith({ fd: 3 });
    });

    it('should call reverseInParallel', () => {
      expect(mockReverseInParallel).toHaveBeenCalledWith(
        '/tmp/built-fd5ce21b.js.map.json',
        trace
      );
    });

    it('should produce a source code location.', () => {
      expect(
        output.indexOf(
          'at this /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/angular/angular.js:12632:28'
        ) !== -1
      ).toBe(true);
    });

    it('should produce a source code location with a line number.', () => {
      const lineNumber = arr ? arr[1] : '';
      expect(lineNumber).toBe('161');
    });

    it('should produce a source code location with a column number.', () => {
      const columnNumber = arr ? arr[2] : '';
      expect(columnNumber).toBe('14');
    });
  });

  fdescribe('worker', () => {
    let handler, mockReverser;

    beforeEach(() => {
      jest.resetAllMocks();
      mockCluster = {
        isMaster: false
      };
      jest.mock('cluster', () => mockCluster);

      mockReverser = jest.fn(() => () => highland([line]));
      jest.mock('../source/reverser.js', () => mockReverser);

      jest.spyOn(process, 'on');
      process.send = jest.fn(() => {});

      require('../source/index.js');

      handler = process.on.mock.calls[0][1];

      handler({
        line,
        srcmapFile
      });
    });

    it('should listen for message events', () => {
      expect(process.on).toHaveBeenCalledWith('message', expect.any(Function));
    });

    it('should call reverser with the sourcemap file', () => {
      expect(mockReverser).toHaveBeenCalled();
    });

    it('should send the new line back to the master', () => {
      expect(process.send).toHaveBeenCalledWith({
        line: [line]
      });
    });
  });
});
