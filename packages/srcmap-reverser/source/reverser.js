// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import { createReadStream } from 'fs';
import srcmapReverse from './src-map-reverse.js';
import highland from 'highland';
import path from 'path';

import type { HighlandStreamT } from 'highland';

const srcMapFile: string =
  process.env.NODE_ENV === 'test'
    ? '../test/fixtures/built-fd5ce21b.js.map.json'
    : 'main.js.map';

const sourceMapStream = highland(
  createReadStream(path.join(__dirname, srcMapFile))
);

export default (s: HighlandStreamT<string>) => {
  return highland([sourceMapStream, s])
    .flatMap(s =>
      s
        .map(x => {
          // This may either be a string
          // or a buffer, but since we only use parts
          // of the API that are effectively
          // polymorphic, we will ignore.
          // $FlowFixMe
          return x.toString('utf8');
        })
        .collect()
        .map(x => x.join(''))
    )
    .collect()
    .map(([srcMap, traceLine]) => srcmapReverse(srcMap, traceLine));
};
