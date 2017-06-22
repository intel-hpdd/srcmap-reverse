// @flow

//
// Copyright (c) 2017 Intel Corporation. All rights reserved.
// Use of this source code is governed by a MIT-style
// license that can be found in the LICENSE file.

import { LEVELS, serializers, default as logger } from '@mfl/logger';
import { join } from 'path';

export default logger({
  path: join(process.env.npm_config__mfl_loggerPath || '', 'client_errors.log'),
  level: LEVELS.ERROR,
  name: 'errors',
  serializers
});
