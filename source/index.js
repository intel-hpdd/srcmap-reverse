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

import { SourceMapConsumer } from 'source-map';
import buildTraceCollection from './build-trace-collection.js';
import http from 'http';
import highland from 'highland';

export type LineData = {
  compiledLine: string,
  url: string,
  line: number,
  column: number
};

type SrcMap = {
  version: number,
  file: string,
  sources: string[],
  names: string[],
  mappings: string,
  sourceRoot: string,
  sourcesContent: string[]
};

type PositionData = {
  line: number,
  column: number,
  source: string,
  name: string
};

let server: http.Server;

const srcMapReverse = (srcMap: SrcMap, trace: string) => {
  const smc = new SourceMapConsumer(srcMap);

  return buildTraceCollection(trace)
    .map((x: LineData) => smc.originalPositionFor(x))
    .map((x: PositionData) => {
      x.name = x.name ? 'at ' + x.name + ' ' : 'at ';
      return x;
    })
    .map((x: PositionData) => `${x.name}${x.source}:${x.line}:${x.column}`)
    .join('\n');
};

export default () => {
  server = http.createServer(
    (request: http.IncomingMessage, response: http.ServerResponse) => {
      const through = highland.pipeline(
        highland.map(x => x.toString('utf-8')),
        highland.collect(),
        highland.map((x: string[]) => x.join('')),
        highland.map((x: string) => {
          const {
            srcMap,
            trace
          }: { srcMap: SrcMap, trace: string } = JSON.parse(x);
          return JSON.stringify(srcMapReverse(srcMap, trace));
        })
      );

      request.pipe(through).pipe(response);
    }
  );

  const port: number = +process.env.npm_package_config_port;
  server.listen(port);

  return server;
};
