// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import highland from 'highland';
import reverser from './reverser.js';

highland(process.stdin)
  .otherwise(highland(['']))
  .through(reverser)
  .pipe(process.stdout);
