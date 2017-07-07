// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import http from 'http';
import highland from 'highland';
import reverseInParallel from './reverse-in-parallel.js';
import clientErrorsLog from './logger.js';

import type { HighlandStreamT } from 'highland';

export default () => {
  const server = http.createServer(
    (request: http.IncomingMessage, response: http.ServerResponse) => {
      const r: HighlandStreamT<Buffer> = highland(request);
      r
        .map(x => x.toString('utf-8'))
        .collect()
        .map((x: string[]) => x.join(''))
        .flatMap((x: string) => {
          const { trace }: { trace: string } = JSON.parse(x);
          clientErrorsLog.error({ trace }, 'Client Error Trace');
          return reverseInParallel(trace);
        })
        .map(xs => JSON.stringify(xs))
        .pipe(response);
    }
  );

  const port: number = +process.env.npm_package_config_port;
  server.listen(port);

  return server;
};
