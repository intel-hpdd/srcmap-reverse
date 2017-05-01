import { LEVELS, default as logger } from '@mfl/logger';

const errorLog = logger({
  path: 'srcmap-reverse-errors.log',
  level: LEVELS.ERROR,
  name: 'errors',
  serializers: {}
});

const reverseLog = logger({
  path: 'srcmap-reverse-trace.log',
  level: LEVELS.INFO,
  name: 'reverseTrace',
  serializers: {}
});

export { errorLog, reverseLog };
