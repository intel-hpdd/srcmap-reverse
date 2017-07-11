// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import { SourceMapConsumer } from 'source-map';
import buildTraceCollection from './build-trace-collection.js';

export type LineData = {
  compiledLine: string,
  url: string,
  line: number,
  column: number
};

type PositionData = {
  line: number,
  column: number,
  source: string,
  name: string
};

export default (srcMap: string, trace: string) => {
  const smc = new SourceMapConsumer(srcMap);
  return buildTraceCollection(trace)
    .map(smc.originalPositionFor.bind(smc))
    .map((x: PositionData) => {
      x.name = x.name ? 'at ' + x.name + ' ' : 'at ';
      return x;
    })
    .map((x: PositionData) => `${x.name}${x.source}:${x.line}:${x.column}`)
    .join('\n');
};
