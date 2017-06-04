test('Should create a default pool', () => {
  const db = require('./db');
  db({
    user: 'express',
    password: 'express',
    database: 'express',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
  });
  expect(db.exists('default')).toBeTruthy();
});

test('Default pool should be already defined', () => {
  const db = require('./db');
  expect(db.exists('default')).toBeTruthy();
});

test('Should add a new pool named "test"', () => {
  const db = require('./db');
  const poolName = 'test';

  db({
    user: 'express',
    password: 'express',
    database: 'express',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
  }, poolName);
  expect(db.exists(poolName)).toBeTruthy();
})

test('Should remove a pool named "test"', () => {
  const db = require('./db');
  const poolName = 'test';

  if (!db.exists(poolName)) {
    db({
      user: 'express',
      password: 'express',
      database: 'express',
      host: 'localhost',
      port: 5432,
      max: 10,
      idleTimeoutMillis: 30000
    }, poolName);
  }

  db.removePool(poolName);
  expect(db.exists(poolName)).toBeFalsy();
});

test('Should connect to db using default pool', done => {
  const db = require('./db');

  function callback(err, client, close) {
    expect(err).toBeNull();
    expect(client).toBeDefined();
    expect(typeof close).toBe('function');
    close();
    done();
  }

  return db.connect(callback);
});
