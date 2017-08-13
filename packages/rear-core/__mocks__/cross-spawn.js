module.exports = (cmd, args) => {
  const EventEmitter = require('events');
  const emitter = new EventEmitter();
  setTimeout(() => {
    const exitCode = process.env.REARTEST_CROSS_SPAWN_EXIT_CODE || 0;
    emitter.emit('close', exitCode);
  });
  return emitter;
}
