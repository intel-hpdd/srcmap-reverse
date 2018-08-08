// @flow

//
// Copyright (c) 2018 DDN. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import highland from 'highland';
import cluster from 'cluster';

export default ({ trace, srcmapFile }: { trace: string, srcmapFile: ?string }) => {
  const lines = trace.split('\n');

  return highland(lines)
    .map((line: string) => [line, cluster.fork()])
    .map(([line, worker]: [string, cluster$Worker]) =>
      highland(push => {
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

        worker.send({
          srcmapFile,
          line
        });
      })
    )
    .parallel(lines.length)
    .collect()
    .map(x => x.join('\n').trim());
};
