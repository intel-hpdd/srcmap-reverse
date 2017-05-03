// @flow

import { Writable } from 'stream';
import { describe, beforeEach, it, expect, jest, jasmine } from './jasmine.js';

const trace = `Error: Come on sourcemaps.
at Object.DashboardFilterCtrl.$scope.filter.onFilterView (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:38:7096)
at https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:14:4896
at https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:14:16407
at Scope.$eval (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:12:12643)
at Scope.$apply (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:12:12989)
at HTMLButtonElement.<anonymous> (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:14:16389)
at HTMLButtonElement.jQuery.event.dispatch (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:7:13226)
at HTMLButtonElement.elemData.handle (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:7:8056)`;
const traceArray = trace.split('\n');

const reversedTrace = `at /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/iml/dashboard/dashboard-filter-controller.js:161:14
at apply /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/angular/angular.js:10795:20
at fn /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/angular/angular.js:19036:16
at this /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/angular/angular.js:12632:28
at $eval /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/angular/angular.js:12730:22
at $apply /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/angular/angular.js:19035:20
at apply /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/jquery/jquery.js:4371:8
at apply /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/bower_components/jquery/jquery.js:4057:27`;
const reversedTraceArray = reversedTrace.split('\n');

const reverseTraceMap = traceArray
  .slice(1)
  .reduce((obj: Object, cur: string, idx: number) => {
    obj[cur] = reversedTraceArray[idx];
    return obj;
  }, {});

describe('reverse in parallel', () => {
  let mockChildProcess,
    mockLogger,
    reverseInParallel,
    reverse$,
    stdInStream,
    spy,
    inputSpy,
    endSpy;

  beforeEach((done: () => void) => {
    spy = jest.fn(() => 'spy');
    inputSpy = jest.fn(() => 'spy');
    endSpy = jest.fn(() => 'spy');

    mockChildProcess = {
      exec: jest.fn(() => 'exec').mockImplementation((cmd, cb) => {
        stdInStream = new Writable({
          write: (chunk, encoding, next) => {
            let val = chunk.toString('utf8');
            inputSpy(val);

            val = val === 'Error: Come on sourcemaps.' || val === ''
              ? ''
              : reverseTraceMap[val];

            cb(null, val);
            next();
          }
        });

        stdInStream.once('finish', () => {
          endSpy();
          done();
        });

        return { stdin: stdInStream };
      })
    };
    jest.mock('child_process', () => mockChildProcess);

    mockLogger = {
      errorLog: jest.fn(() => 'errorLog')
    };
    jest.mock('../source/logger.js', () => mockLogger);

    reverseInParallel = require('../source/reverse-in-parallel.js').default;

    reverse$ = reverseInParallel(trace);
    reverse$.each(spy);
  });

  it('should start the subprocess for each line', () => {
    expect(mockChildProcess.exec).toHaveBeenCalledWith(
      `node packages/srcmap-reverser/dist/bundle.js`,
      jasmine.any(Function)
    );
  });

  [0, 1, 2, 3, 4, 5, 6, 7].forEach(idx => {
    it(`should write item ${idx + 1} to the subprocess stream`, () => {
      expect(inputSpy).toHaveBeenCalledWith(traceArray[idx]);
    });
  });

  it('should end the stream for each line', () => {
    expect(endSpy).toHaveBeenCalledTimes(9);
  });

  it('should return the collected reverse trace', () => {
    expect(spy).toHaveBeenCalledWith(reversedTrace);
  });
});
