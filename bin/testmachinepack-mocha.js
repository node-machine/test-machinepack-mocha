#!/usr/bin/env node

/**
 * Module dependencies
 */
var path = require('path');
var _ = require('lodash');
var Mocha = require('mocha');


// Test pack in current working directory using mocha test driver
//
// (based on example @ https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically)


// Allow the customization of mocha args by passing in CLI flags
// from within the project's package.json
function getCliFlag(cliFlag, defaultVal){
  var pos = process.argv.indexOf(cliFlag);
  var result = defaultVal;
  if (pos > -1 && process.argv[pos + 1] !== undefined) {
    result = process.argv[pos + 1];
  }
  else if (pos > -1) {
    result = true;
  }
  return result;
}

var mocha = new Mocha({
  timeout: getCliFlag('-t', 10000),
  grep: getCliFlag('-g'),
  bail: getCliFlag('-b'),
  reporter: getCliFlag('-R', 'spec')
});
mocha.addFile(path.resolve(__dirname,'../mocha-test.js'));
mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);
  });
});
