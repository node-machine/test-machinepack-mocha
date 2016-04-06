/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('lodash');
var testMachine = require('test-machinepack').testMachine;



/////////////// NOTE /////////////////////////////////////////////////////////////
/// This is just here for reference so the secrets of `it` are not forgotten.  //
////////////////////////////////////////////////////////////////////////////////
// it: {
//   'should NOT have any errors': SHOULD_NOT_HAVE_ANY_ERRORS,
//   'should reflect that `.stabilize()` provided the defaultsTo value to `getExample()`': function (output, done) {
//     var termOfInterest = _.find(output.expression, {path: ''});
//     if (!termOfInterest) {
//       return done('root term is missing');
//     }
//     if (termOfInterest.example !== 1) {
//       return done('unexpected `example` in root term-- expecting `1`');
//     }
//     return done();
//   }
// }
// // Post-condition assertions
// var SHOULD_NOT_HAVE_ANY_ERRORS = function (output, done) {
//   if (output.errors.length > 0) {
//     return done('got '+output.errors.length+ ' errors');
//   }
//   return done();
// };

module.exports = function testWithMocha (_machineInstance) {

  var machineInstance;
  machineInstance = _machineInstance;

  var explanation;
  var using = {};
  var failureReport = {};
  var whatActuallyHappened;

  var chain = {};
  chain.machine = function (_machineInstance) {
    machineInstance = _machineInstance;
    return chain;
  };
  chain.use = function (configuredInputVals){
    using = configuredInputVals;
    return chain;
  };

  chain.explain = function (_explanation){
    explanation = _explanation;
    return chain;
  };

  // `expect` is what actually sets up the tests.
  chain.expect = function (expectations){

    // Set up Mocha `before` block.
    before(function (done){

      testMachine({
        machineInstance: machineInstance,
        using: using,
        expectedOutcome: expectations.outcome,
        expectedOutput: expectations.output,
        maxDuration: expectations.maxDuration,
        postConditions: _.reduce(expectations.it||{}, function (memo, fn, label){
          memo.push({
            label: label,
            fn: fn
          });
          return memo;
        }, [])
      }).exec({
        error: function (err) {
          return done(err);
        },
        failed: function (_failureReport){
          failureReport = _failureReport;
          whatActuallyHappened = failureReport.actual;
          return done();
        },
        success: function (_whatActuallyHappened){
          whatActuallyHappened = _whatActuallyHappened;
          return done();
        }
      });
    });

    // Set up Mocha `it` blocks.
    if (!_.isUndefined(expectations.outcome)) {
      it('should have outcome: `'+expectations.outcome+'`', function (done){
        if (!failureReport.wrongOutcome) {
          return done();
        }
        return done( new Error('actual outcome is "'+whatActuallyHappened.outcome+'".\n\nOutput is:\n'+(_.isError(whatActuallyHappened.output)?whatActuallyHappened.output.stack:util.inspect(whatActuallyHappened.output, false, null)) ) );
      });
    }
    if (!_.isUndefined(expectations.output)) {
      it('should have the expected output', function (done){
        if (!failureReport.wrongOutput) {
          return done();
        }
        return done( new Error('actual output is `'+util.inspect(whatActuallyHappened.output, false, null)+'`') );
      });

    }
    if (!_.isUndefined(expectations.maxDuration)) {
      it('should finish in no more than '+ expectations.maxDuration+' ms', function (done){
        if (!failureReport.tookTooLong) {
          return done();
        }
        return done( new Error('actually took '+whatActuallyHappened.duration+'  ms.') );
      });
    }

    // Optional explanation
    if (!_.isUndefined(explanation)) {
      it(explanation, function (done){ return done(); });
    }

    _.each(expectations.it||{}, function (fn, label){
      it(label, function (done){
        var failedPostCondition = _.find(failureReport.failedPostConditions, {label: label});
        if (!failedPostCondition) {
          return done();
        }
        return done(failedPostCondition.error);
      });
    });


  };

  return chain;
};
