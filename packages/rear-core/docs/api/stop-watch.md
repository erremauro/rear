# stop-watch

Use `StopWatch` to track time passed.

## Examples

### Tracking time

  ```javascript
  const { StopWatch } = require('rear-core/stop-watch');

  const watch = new StopWatch();
  watch.start();

  setTimeout(() => {
    watch.stop();
    // output: 3.2s
    console.log(watch.diff().toString('s'))
  }, 3000);
  ```

### Store and access sets

In this example, `StopWatch` is used to register 4 `sets` of random intervals
and then print each set result.

Note that the example make use of the ES6 syntax `for of ` to iterate the
[Set].

Since each set item is a `WatchSet` object, `toString()` can be used to format
the diff result.

  ```javascript
  const { StopWatch } = require('rear-core/stop-watch');
  const watch = new StopWatch();

  let interval;
  interval = newInterval(() => {
    watch.restart();

    if (watch.sets.size > 4) {
      clearInterval(interval);
    }

  }, Math.random() * (3000 - 1000) + 1000);

  let count = 0;
  for (let watchSet of watch.sets) {
    count++;
    console.log(`Set #${count}: ${watchSet.toString()}`);
  }
  ```

[Set]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set


## API

## WatchSet

### Properties

| Name  | Type     | Description        |
|-------|----------|--------------------|
| begin | `number` | The beginning time |
| end   | `number` | The end time       |

### Methods

#### constructor ( props?: WatchSetTime )

Creates a new `WatchSet` with provided `begin` and `end` `props` or with
a default value of `0` for both.

#### diff (): number

Returns the time span in `ms` between end and begin time.

##### Returns

`number` Time span between end and begin time.

#### toString ( format?: string): string

Format a `WatchSet` object time span to string. When a `format` is not
specified, the nearest appropriate formatted string is returned (given the time).

Accepted formats are:

* `ms` (milliseconds)
* `s` (seconds)
* `m` (minutes)
* `H` (hours)

##### Returns

`string` Time span formatted to given or nearest appropriate time format.

## StopWatch

A simple `StopWatch` object to keep track of time passed.

### Properties

| Name  | Type            | Description        |
|-------|-----------------|--------------------|
| begin | `number`        | The beginning time |
| end   | `number`        | The end time       |
| sets  | `Set<WatchSet>` | Saved sets         |

### Methods

#### start (): void

Start the `StopWatch`

#### stop (): void

Stop the `StopWatch` and add the current `WatchSet` to the `sets`.

#### restart (): void

Stop and restart the `StopWatch`.

#### reset (): void

Reset the current `StopWatch` object.

#### saveSet (): void

Add the current `WatchSet` to the `sets`.

#### getWatchSet ( index: number): WatchSet?

Get a `WatchSet` from the `sets` by the given `index` position.

##### Returns

`WatchSet` The set at the given `idex`.

#### isEqual ( watchSet: WatchSet ): boolean

Compare a `WatchSet` object to another `watchSet` for equality.

##### Returns

`boolean` True if both are quals, otherwise false.

### Extends

* `WatchSet`
