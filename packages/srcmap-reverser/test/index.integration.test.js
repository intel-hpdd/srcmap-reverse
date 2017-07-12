// @flow

import { describe, beforeEach, it, expect, jest } from './jasmine.js';
import { exec } from 'child_process';

describe('srcmap-reverser', () => {
  let spy, index;
  beforeEach(done => {
    spy = jest.fn(() => 'spy');

    index = exec(
      'node packages/srcmap-reverser/dist/srcmap-reverser.js',
      (e: ?Error, x: string) => {
        spy(x);
        done();
      }
    );

    index.stdin.write(
      'at Object.DashboardFilterCtrl.$scope.filter.onFilterView (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:38:7096)'
    );
    index.stdin.end();
  });

  it('should reverse the line', () => {
    expect(spy).toHaveBeenCalledWith(
      'at /Users/wkseymou/projects/chroma/chroma-manager/chroma_ui_new/source/chroma_ui/iml/dashboard/dashboard-filter-controller.js:161:14'
    );
  });
});
