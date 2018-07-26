// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

export type Port = number | { fd: number };

export const getPort = (port:?string, fd:?string) : Port => {
  let serverPort = parseInt(port, 10) || 80;
  if (fd != null) 
    serverPort = { fd: parseInt(fd, 10) };
  
  return serverPort;
}