const config = require('./jest.config.js');

module.exports = Object.assign({}, config, { testRegex: "\\.test\\.js$" });
