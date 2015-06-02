/**
 * Module dependencies
 */

var _ = require('lodash');
var path = require('path');
var tmp = require('tmp-sync');
var fsx = require('fs-extra');
var RawMachinepackTestRunner = require('test-machinepack').rawTestRunner;

var root = process.cwd();
var tmproot = path.join(root, 'tmp');


// Customize generic test driver for mocha
module.exports = function mochaDriver(pathToMachinepackDir) {

  // Use cwd as our path unless overridden by the arg above
  pathToMachinepackDir = pathToMachinepackDir || root;

  var opts = {};
  RawMachinepackTestRunner(pathToMachinepackDir,function beforeRunningAnyTests(_opts, done){
    // Expose provided options via closure for use throughout this module.
    opts = _opts || {};

    // TODO: set mocha.opts based on `opts.driver.*` (if provided)
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
        fsx.removeSync(tmproot);
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
  }, function afterRunningAllTests(err, missingSuites) {
    if (err) {
      console.error('test-machinepack-mocha encountered an error while running tests:\n',err);
      return;
    }

    // If `showMissingSuites` option is set, log a message to the console
    // enumerating untested machines.
    if (opts.showMissingSuites) {
      after(function(){
        if (_.isArray(missingSuites) && missingSuites.length > 0) {
          showMissingSuites(missingSuites);
        }
      });
    }
  });
};


function showMissingSuites(missingSuites) {
  // Use setTimeout so that these logs appear after the mocha output
  setTimeout(function() {
    // Pad a line with spaces
    var pad = function(line, lineLength) {
      if (line.length < lineLength) {
        line += Array((lineLength - line.length) + 1).join(" ");
      }
      return line;
    };
    // Find the longest machine ID
    var longestMachineId = _.reduce(missingSuites, function(memo, machineId) {return machineId.length > memo ? machineId.length : memo;}, 0);
    // Static instructional lines
    var instrLine1 = "The following machines are missing test suites:";
    var instrLine2 = "Try using `mp scrub` to generate test stubs!";
    // Determine the length of each line in the output (either using the longest machine name, or the first instruction)
    var lineLength  = longestMachineId < instrLine1.length ? instrLine1.length : longestMachineId;
    // Create a line of stars for the top and bottom
    var borderLine = Array(lineLength + 5).join("*");
    // Create a line with stars on each end and spaces in the middle
    var spacerLine = "*" + Array(lineLength + 3).join(" ") + "*";
    // Output the top
    console.error(borderLine);
    // Output a spacer line
    console.error(spacerLine);
    // Output instruction 1
    console.error("* " + pad(instrLine1, lineLength) + " *");
    // Output a spacer line
    console.error(spacerLine);
    // Output the names of each missing machine suite
    _.each(missingSuites, function(machineId) {
      console.error("* " + pad(machineId, lineLength) + " *");
    });
    // Output a spacer line
    console.error(spacerLine);
    // Output instruction 2
    console.error("* " + pad(instrLine2, lineLength) + " *");
    // Output a spacer line
    console.error(spacerLine);
    // Output the bottom
    console.error(borderLine);
  });
}
