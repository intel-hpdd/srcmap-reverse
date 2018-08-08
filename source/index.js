// @flow

//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import http from 'http';
import highland from 'highland';
import reverseInParallel from './reverse-in-parallel.js';
import cluster from 'cluster';
import reverser from './reverser.js';

import type { HighlandStreamT } from 'highland';

if (cluster.isMaster) {
  const server = http.createServer(
    (request: http.IncomingMessage, response: http.ServerResponse) => {
      const r: HighlandStreamT<Buffer> = highland(request);

      r
        .map(x => x.toString('utf-8'))
        .collect()
        .map((x: string[]) => x.join(''))
        .map(JSON.parse)
        .flatMap(reverseInParallel)
        .map(xs => JSON.stringify(xs))
        .tap(console.log)
        .pipe(response);
    }
  );

  server.listen({ fd: parseInt(process.env.SRCMAP_REVERSE_FD, 10) });
} else {
  process.on(
    'message',
    ({ line, srcmapFile }: { line: string, srcmapFile: ?string }) => {
      highland([line])
        .otherwise(highland(['']))
        .through(reverser(srcmapFile))
        .collect()
        .errors((e: Error) => {
          if (process.send) process.send({ error: e });
        })
        .each((line: string[]) => {
          if (process.send) process.send({ line });
        });
    }
  );
}
