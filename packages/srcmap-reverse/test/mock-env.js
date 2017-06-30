const oldPort = process.env.npm_package_config_port;
const oldSrcMapFile = process.env.npm_package_config_srcMapFile;

beforeEach(() => {
  process.env.npm_package_config_port = 8082;
  process.env.npm_package_config_srcMapFile =
    'packages/srcmap-reverser/test/fixtures/built-fd5ce21b.js.map.json';
});

afterEach(() => {
  process.env.npm_package_config_port = oldPort;
  process.env.npm_package_config_srcMapFile = oldSrcMapFile;
});
