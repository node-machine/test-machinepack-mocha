#!/usr/bin/env node

// Test pack in current working directory using mocha test driver
//
// (based on example @ https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically)
var path = require('path');
var Mocha = require('mocha');
//allow the customization of the timeout by passing a -t flag
//from within the projects package.json
var timeoutPos = process.argv.indexOf('-t');
var timeout = 10000;
if (timeoutPos > -1 && process.argv[timeoutPos + 1] !== undefined) {
  timeout = process.argv[timeoutPos + 1];
}

var mocha = new Mocha({
  timeout: timeout
});
mocha.addFile(path.resolve(__dirname,'../mocha-test.js'));
mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);
  });
});
