// @flow

//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import { createReadStream } from 'fs';
import srcmapReverse from './srcmap-reverse.js';
import highland from 'highland';
import glob from 'glob';

import type { HighlandStreamT } from 'highland';

if (process.env.SOURCE_MAP_PATH == null)
  throw new Error('SOURCE_MAP_PATH environment variable must be set to load the sourcemap file.');

const sourceMapPath = process.env.SOURCE_MAP_PATH;
const sourceMapFile = glob.sync(sourceMapPath)[0];

export default () => (s: HighlandStreamT<string>) => {
  const sourceMapStream = highland(createReadStream(sourceMapFile));

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
