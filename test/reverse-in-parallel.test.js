// @flow

import { describe, beforeEach, it, expect, jest } from './jasmine.js';

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

describe('reverse in parallel', () => {
  let reverseInParallel, reverse$, mockCluster, workers, spy;

  beforeEach((done: () => void) => {
    workers = [];

    mockCluster = {
      fork: jest.fn(() => {
        const worker = {
          on: jest.fn(() => {}),
          kill: jest.fn(),
          send: jest.fn(() => 'spy')
        };
        workers.push(worker);

        return worker;
      })
    };

    spy = jest.fn(() => 'spy');

    jest.mock('cluster', () => mockCluster);

    reverseInParallel = require('../source/reverse-in-parallel.js').default;

    reverse$ = reverseInParallel({ srcmapFile: undefined, trace });
    reverse$.each(x => {
      spy(x);
      done();
    });

    workers.forEach((x, idx) => {
      x.on.mock.calls[0][1]({
        line: reversedTraceArray[idx]
      });
    });
  });

  it('should fork the cluster for each line', () => {
    expect(mockCluster.fork).toHaveBeenCalledTimes(9);
  });

  it('should call worker.on whenever a message is received', () => {
    workers.forEach(worker => {
      expect(worker.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(worker.on).toHaveBeenCalledTimes(1);
    });
  });

  it('should kill each worker', () => {
    workers.forEach(worker => {
      expect(worker.kill).toHaveBeenCalledTimes(1);
    });
  });

  it('should send the line to the worker', () => {
    workers.forEach((worker, idx) => {
      expect(worker.send).toHaveBeenCalledWith({
        line: traceArray[idx],
        srcmapFile: undefined
      });
    });
  });

  it('should return the collected reverse trace', () => {
    expect(spy).toHaveBeenCalledWith(reversedTrace);
  });
});
