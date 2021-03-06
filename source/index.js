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
import { getPort } from './port.js';

import type { HighlandStreamT } from 'highland';

if (cluster.isMaster) {
  const server = http.createServer((request: http.IncomingMessage, response: http.ServerResponse) => {
    const r: HighlandStreamT<Buffer> = highland(request);

    r.map(x => x.toString('utf-8'))
      .collect()
      .map((x: string[]) => x.join(''))
      .map(JSON.parse)
      .flatMap(reverseInParallel)
      .map(xs => JSON.stringify(xs))
      .tap(console.log)
      .pipe(response);
  });

  const port = getPort();
  server.listen(port);
} else {
  process.on('message', ({ line }: { line: string }) => {
    highland([line])
      .otherwise(highland(['']))
      .through(reverser())
      .collect()
      .errors((e: Error) => {
        if (process.send) process.send({ error: e });
      })
      .each((line: string[]) => {
        if (process.send) process.send({ line });
      });
  });
}
