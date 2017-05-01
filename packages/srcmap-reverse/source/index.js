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

import http from 'http';
import highland from 'highland';
import reverseInParallel from './reverse-in-parallel.js';

let server: http.Server;

export default () => {
  server = http.createServer(
    (request: http.IncomingMessage, response: http.ServerResponse) => {
      const through = highland.pipeline(
        highland.map(x => x.toString('utf-8')),
        highland.collect(),
        highland.map((x: string[]) => x.join('')),
        highland.flatMap((x: string) => {
          const { trace }: { trace: string } = JSON.parse(x);
          return reverseInParallel(trace);
        }),
        highland.map(xs => {
          return JSON.stringify(xs);
        })
      );

      request.pipe(through).pipe(response);
    }
  );

  const port: number = +process.env.npm_package_config_port;
  server.listen(port);

  return server;
};
