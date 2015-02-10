/**
 * Module dependencies
 */

var _ = require('lodash');
var RawMachinepackTestRunner = require('test-machinepack').rawTestRunner;
var tmp = require('tmp-sync');
var fs = require('fs-extra');

var root = process.cwd();
var tmproot = path.join(root, 'tmp');


// Customize generic test driver for mocha
module.exports = function mochaDriver(pathToMachinepackDir) {

  // Use cwd as our path unless overridden by the arg above
  pathToMachinepackDir = pathToMachinepackDir || root;

  RawMachinepackTestRunner(pathToMachinepackDir,function beforeRunningAnyTests(opts, done){
    // e.g. set mocha.opts based on generic `opts` provided
    // TODO
    done();
  }, function eachMachineSuite(machineIdentity, runTests){
    describe('`'+machineIdentity+'` machine', function (){
      var tmpdir;

      before(function(){
        tmpdir = tmp.in(tmproot);
        process.chdir(tmpdir);
      });

      after(function(){
        process.chdir(root);
        fs.remove(tmproot);
      });

      runTests(function onTest(testCase, nextTestCase){
        var jsonInputVals;
        try {
          jsonInputVals = JSON.stringify(testCase.using);
        }
        catch (e) {
        }

        if (testCase.todo) {
          it('should exit with `'+testCase.outcome+'`'+(_.isUndefined(jsonInputVals)?'':' given input values: `'+jsonInputVals+'`') );
          return nextTestCase();
        }

        it('should exit with `'+testCase.outcome+'`'+ (_.isUndefined(jsonInputVals)?'':' given input values: `'+jsonInputVals+'`'), function (done){
          return nextTestCase(done);
        });
      });
    });
  }, function afterRunningAllTests(err) {
    // Done.
  });
};
