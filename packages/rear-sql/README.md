# rear-sql

A library to create and execute parametized SQL query against postgresql database connection pools.

## Overview

rear-sql expose two object:

- **db**: to manage postgresql connection pools
- **query**: to create and execute parametized queries

## db API

### createPool(config: PgConfig, name: ?string)

Create and add a new db pool to the managed pools

#### Parameters

<dl>
  <dt>config</dt>
  <dd>pg config object</dd>

  <dt>name</dt>
  <dd>Optional pool name. <em>Default</em>: 'default'</dd>
</dl>

### Example

  ```javascript
  const {db} = require('rear-sql');
  db.createPool({
    user: 'test',
    password: 'test',
    database: 'test',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
  }, 'myPool');

  // ...
  ```

### removePool(name: ?string)

Remove an existing pool named `name`.

#### Parameters

<dl>
  <dt>name</dt>
  <dd>Optional pool name. <em>Default</em>: 'default'</dd>
</dl>

### getPool(name: ?string): PgPool

Get an existing pool named `name`.

#### Parameters

<dl>
  <dt>name</dt>
  <dd>Optional pool name. <em>Default</em>: 'default'</dd>
</dl>

### exists(name: ?string): boolean

Check if a pool named `name` exists.

#### Parameters

<dl>
  <dt>name</dt>
  <dd>Optional pool name. <em>Default</em>: 'default'</dd>
</dl>

### connect(cb: Function, name: ?string)

Connect to the database and return a pool client that can perform queries
against the database.

#### Parameters

<dl>
  <dt>cb</dt>
  <dd>Called upon database connection.</dd>
</dl>

<dl>
  <dt>name</dt>
  <dd>Optional pool name. <em>Default</em>: 'default'</dd>
</dl>

#### Example

  ```javascript
  const {db} = require('rear-sql');

  db.createPool({
    user: 'test',
    password: 'test',
    database: 'test',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
  });

  const sqlQuery = {
    text: 'SELECT * FROM table WHERE ID = $1',
    values: [1]
  }

  db.connect((err, client, done) => {
    if (err) {
      throw err;
    }

    client.query(sqlQuery, (err, results) => {

    });
  })
  ```
## query API

### SQL(parts: Array<string>, ...values: Array[any]): PgSqlQuery

Create pg sql query object from a _literal string_.

#### Types

  ```
  type PgSqlQuery {
    text: string,
    values: Array<any>
  }
  ```

#### Example

  ```javascript
  const {SQL} = require('rear-sql/query');
  const username = "test";
  const password = "test01";

  const sqlQuery = SQL`INSERT INTO table VALUES(${username}, ${password});`
  db.query(sqlQuery, (err, results) => {
    // use results here...
  })
  ```

### exec(query: PgSqlQuery, name: ?string): Promise<PgQueryResult>

Execute a pg SQL query and return a **Promise** with the results.

#### Parameters

<dl>
  <dt>query</dt>
  <dd>A pg SQL query to run.</dd>
</dl>

<dl>
  <dt>name</dt>
  <dd>Optional pool name. <em>Default</em>: 'default'</dd>
</dl>

#### Example

  ```javascript
  const {query} = require('rear-sql');

  const sqlQuery = query.SQL`SELECT * FROM table`

  query
    .exec(sqlQuery)
    .then(results => {
      for (let i = 0; i < results.rows.length; i++) {
        console.log(results.rows[i]);
      }
    }):
  ```

