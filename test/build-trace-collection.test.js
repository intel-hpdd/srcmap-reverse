// @flow

import { describe, beforeEach, it, expect } from './jasmine.js';
import buildTraceCollection from '../source/build-trace-collection.js';

describe('build trace collection', () => {
  let xs, lineData;
  beforeEach(() => {
    xs = `Error: Come on sourcemaps.
at Object.DashboardFilterCtrl.$scope.filter.onFilterView (https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:38:7096)
at https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:14:4896
at https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:14:16407
`;
    lineData = buildTraceCollection(xs);
  });

  it('should return line data', () => {
    expect(lineData).toEqual([
      {
        compiledLine:
          'https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:38:7096',
        url: 'https://localhost:8000/static/chroma_ui/built-fd5ce21b.js',
        line: 38,
        column: 7096
      },
      {
        column: 4896,
        compiledLine:
          'https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:14:4896',
        line: 14,
        url: 'https://localhost:8000/static/chroma_ui/built-fd5ce21b.js'
      },
      {
        column: 16407,
        compiledLine:
          'https://localhost:8000/static/chroma_ui/built-fd5ce21b.js:14:16407',
        line: 14,
        url: 'https://localhost:8000/static/chroma_ui/built-fd5ce21b.js'
      }
    ]);
  });
});
