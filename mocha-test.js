// Run tests
// (this file should be invoked with mocha-- see bin/testmachinepack-mocha)
var singleMachineToTest = process.argv[2];
require('./')(null, singleMachineToTest);
