const pg = require('pg');
const pools = {};

function PoolManager(config, name) {
  PoolManager.createPool(config, name);
}

PoolManager.createPool = (config, name) => {
  if (!name) {
    name = 'default';
  }

  const newPool = new pg.Pool(config);
  newPool.on('error', function (err, client) {
    // if an error is encountered by a client while it sits idle in the pool
    // the pool itself will emit an error event with both the error and
    // the client which emitted the original error
    // this is a rare occurrence but can happen if there is a network partition
    // between your application and the database, the database restarts, etc.
    // and so you might want to handle it and at least log it out
    console.error('[' + name + '] idle client error', err.message, err.stack);
  });

  pools[name] = newPool;
}

PoolManager.removePool = (name) => {
  if (pools.hasOwnProperty(name)) {
    delete pools[name];
  }
}

PoolManager.getPool = (name) => {
  if (!name) {
    name = 'default';
  }

  const pool = pools[name];

  if (!pool) {
    throw new Error('Cannot find a pool named ' + name);
  }

  return pool;
}

PoolManager.exists = (name) => {
  return typeof pools[name] !== 'undefined';
}

PoolManager.connect = (cb, name) => {
  const db = PoolManager.getPool(name);
  return db.connect(cb);
}

module.exports = PoolManager;
