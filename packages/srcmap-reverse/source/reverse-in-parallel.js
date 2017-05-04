// @flow

//
// INTEL CONFIDENTIAL
//
// Copyright 2013-2017 Intel Corporation All Rights Reserved.
//
// The source code contained or described herein and all documents related
// to the source code ("Material") are owned by Intel Corporation or its
// suppliers or licensors. Title to the Material remains with Intel Corporation
// or its suppliers and licensors. The Material contains trade secrets and
// proprietary and confidential information of Intel or its suppliers and
// licensors. The Material is protected by worldwide copyright and trade secret
// laws and treaty provisions. No part of the Material may be used, copied,
// reproduced, modified, published, uploaded, posted, transmitted, distributed,
// or disclosed in any way without Intel's prior express written permission.
//
// No license under any patent, copyright, trade secret or other intellectual
// property right is granted to or conferred upon you by disclosure or delivery
// of the Materials, either expressly, by implication, inducement, estoppel or
// otherwise. Any license under such intellectual property rights must be
// express and approved by Intel in writing.

import highland from 'highland';
import { exec } from 'child_process';
import clientErrorsLog from './logger.js';

export default (trace: string) => {
  const lines = trace.split('\n');

  return highland(lines)
    .map((line: string) => {
      return highland(push => {
        const reverse = exec(
          `node ${__dirname}/../node_modules/@mfl/srcmap-reverser/dist/bundle.js`,
          (err, x) => {
            if (err) {
              clientErrorsLog.error({ err }, 'Reversing source map');
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
