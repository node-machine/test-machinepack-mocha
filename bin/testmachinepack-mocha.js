#!/usr/bin/env node

// Test pack in current working directory using mocha test driver
//
// (based on example @ https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically)
var path = require('path');
var Mocha = require('mocha');
var mocha = new Mocha({
  timeout: 10000
});
mocha.addFile(path.resolve(__dirname,'../mocha-test.js'));
mocha.run(function(failures){
  process.on('exit', function () {
    process.exit(failures);
  });
});
