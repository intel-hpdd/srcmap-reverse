const config = require('./jest.config.js');

module.exports = Object.assign({}, config, { testRegex: '\\.itest\\.js$' });
