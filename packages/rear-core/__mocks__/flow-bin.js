if (process.env.REARTEST_FLOW_BIN) {
  module.exports = './totally_fake_modules/.bin/flow';
} else {
  var err = new Error(`Cannot find module 'flow-bin'`);
  err.code = 'MODULE_NOT_FOUND';
  throw err;
}
