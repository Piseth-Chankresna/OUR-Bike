// Karma configuration file
module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-firefox-launcher'),
      require('karma-edge-launcher')
    ],
    client: {
      jasmine: {
        random: false
      },
      clearContext: false,
      testRunner: "jasmine",
      captureConsole: true,
      codeCoverage: {
        reporters: [
          { type: 'html', subdir: '.', file: 'coverage.html' },
          { type: 'text-summary', subdir: '.', file: 'coverage.txt' },
          { type: 'lcov', subdir: '.', file: 'coverage.lcov' }
        ],
        dir: require('path').join(__dirname, 'coverage'),
        reporters: ['coverage-istanbul'],
        check: {
          global: {
            statements: 80,
            branches: 80,
            functions: 80,
            lines: 80
          }
        }
      }
    },
    reporters: ['progress', 'kjhtml', 'coverage-istanbul'],
    browsers: ['Chrome'],
    autoWatch: true,
    singleRun: false,
    restartOnFileChange: true,
    files: [
      { pattern: 'src/test.ts', watched: false },
      { pattern: 'src/**/*.spec.ts', watched: false },
      { pattern: 'src/**/*.d.ts', watched: false }
    ],
    preprocessors: ['@angular-devkit/build-angular'],
    mime: {
      'text/x-typescript': ['ts']
    },
    coverageReporter: {
      type: 'html',
      dir: 'coverage/',
      subdir: '.',
      file: 'coverage.html'
    },
    reporters: [
      'progress',
      'karma-coverage-istanbul'
    ],
    colors: true,
    logLevel: config.LOG_INFO,
    browserNoActivityTimeout: 20000,
    browserDisconnectTimeout: 20000,
    browserDisconnectTolerance: 3,
    browserConsoleLogOptions: {
      level: 'debug',
      format: '%b %d: %m'
    }
  });
};
