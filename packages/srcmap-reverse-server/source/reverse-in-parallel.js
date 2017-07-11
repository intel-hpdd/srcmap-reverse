// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import highland from 'highland';
import { exec } from 'child_process';

export default (trace: string) => {
  const lines = trace.split('\n');

  return highland(lines)
    .map((line: string) => {
      return highland(push => {
        const reverse = exec(
          `node ${require.resolve('@iml/srcmap-reverser')}`,
          (err, x) => {
            if (err) {
              console.error({ err }, 'Reversing source map');
              push(null, Buffer.from(line, 'utf8'));
            } else {
              if (x.length > 0) push(null, x);
            }

            push(null, highland.nil);
          }
        );

        reverse.stdin.write(line);
        reverse.stdin.end();
      });
    })
    .parallel(lines.length)
    .map((x: Buffer) => x.toString('utf8'))
    .collect()
    .map(x => x.join('\n'));
};
