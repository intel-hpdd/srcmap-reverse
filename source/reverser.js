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

export default (srcmapFile: ?string) => (s: HighlandStreamT<string>) => {
  srcmapFile =
    srcmapFile || glob.sync('/usr/lib/iml-manager/iml-gui/main.*.js.map')[0];
  const sourceMapStream = highland(createReadStream(srcmapFile));

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
