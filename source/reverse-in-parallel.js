// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import highland from 'highland';
import cluster from 'cluster';

export default (trace: string) => {
  const lines = trace.split('\n');

  const workers = [];
  for (let i = 0; i < lines.length; i++) workers.push(cluster.fork());

  return highland(lines)
    .map((line: string) => {
      const worker = workers.pop();

      return highland(push => {
        worker.on('message', msg => {
          if (msg.error) {
            console.error(msg.error, 'Reversing source map');
            push(null, Buffer.from(line, 'utf8'));
          } else if (msg.line) {
            push(null, msg.line);
          }

          push(null, highland.nil);
          worker.kill();
        });

        worker.send(line);
      });
    })
    .parallel(lines.length)
    .collect()
    .map(x => x.join('\n').trim());
};
