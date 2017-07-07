module.exports = {
  resetModules: true,
  coveragePathIgnorePatterns: ['/node_modules/', 'test', 'dist'],
  transformIgnorePatterns: ['/node_modules/(?!@iml)/'],
  setupTestFrameworkScriptFile: './test/mock-env.js'
};
