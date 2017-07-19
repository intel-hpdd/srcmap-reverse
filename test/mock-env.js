import { beforeEach, afterEach } from './jasmine.js';

const oldPort = process.env.npm_package_config_port;

beforeEach(() => {
  process.env.npm_package_config_port = 8082;
});

afterEach(() => {
  process.env.npm_package_config_port = oldPort;
});
