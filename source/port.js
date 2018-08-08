// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

export type Port = number | { fd: number };

const isSystemd: boolean = process.env.LISTEN_PID != null ? parseInt(process.env.LISTEN_PID, 10) > 0 : false;

export const getPort = (): Port => {
  if (isSystemd) return { fd: 3 };
  else if (process.env.SRCMAP_REVERSE_PORT != null) return parseInt(process.env.SRCMAP_REVERSE_PORT, 10);
  else
    throw new Error(
      'If srcmap-reverse is not running in systemd, the SRCMAP_REVERSE_PORT environment variable is required.'
    );
};
