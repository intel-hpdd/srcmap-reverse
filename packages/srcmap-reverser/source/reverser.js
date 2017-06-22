// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import { createReadStream } from 'fs';
import srcmapReverse from './src-map-reverse.js';
import highland from 'highland';

import type { HighlandStreamT } from 'highland';

const srcMapFile: string =
  process.env.npm_config__mfl_srcmap_reverse_srcMapFile || '';

const sourceMapStream = highland(createReadStream(srcMapFile));

export default (s: HighlandStreamT<string>) => {
  return highland([sourceMapStream, s])
    .flatMap(s => s.map(x => x.toString('utf8')).collect().map(x => x.join('')))
    .collect()
    .map(([srcMap, traceLine]) => srcmapReverse(srcMap, traceLine));
};
