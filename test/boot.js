'use strict';

if (process.env.RUNNER === 'CI') {
  var krustyJasmineReporter = require('krusty-jasmine-reporter');

  var junitReporter = new krustyJasmineReporter.KrustyJasmineJUnitReporter({
    specTimer: new jasmine.Timer(),
    JUnitReportSavePath: process.env.SAVE_PATH || './',
    JUnitReportFilePrefix: process.env.FILE_PREFIX || 'srcmap-reverse-results',
    JUnitReportSuiteName: 'Srcmap Reverse Reports',
    JUnitReportPackageName: 'Srcmap Reverse Reports'
  });

  jasmine.getEnv().addReporter(junitReporter);
}
