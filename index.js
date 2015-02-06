/**
 * Module dependencies
 */

var _ = require('lodash');
var RawMachinepackTestRunner = require('test-machinepack').rawTestRunner;


// Customize generic test driver for mocha
module.exports = function mochaDriver(pathToMachinepackDir) {

  // Use cwd as our path unless overridden by the arg above
  pathToMachinepackDir = pathToMachinepackDir || process.cwd();

  RawMachinepackTestRunner(pathToMachinepackDir,function beforeRunningAnyTests(opts, done){
    // e.g. set mocha.opts based on generic `opts` provided
    // TODO
    done();
  }, function eachMachineSuite(machineIdentity, runTests){
    describe('`'+machineIdentity+'` machine', function (){
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
