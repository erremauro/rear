const {StopWatch, WatchSet} = require('../stop-watch');

describe('StopWatch', () => {
  it('Should reset to initial values', () =>{
    const startDate = new Date('2000-01-01');
    const endDate = new Date('2000-01-01');
    endDate.setMilliseconds(4500);

    const watch = new StopWatch();
    watch.begin = startDate.getTime();
    watch.end = endDate.getTime();

    expect(watch.diff()).toEqual(4500);

    watch.reset();

    expect(watch.diff()).toEqual(0);
    expect(watch.sets.size).toEqual(0);
  });

  it('Should register a set every time is started and stopped', () => {
    const watch = new StopWatch();

    watch.start();
    watch.restart();   // 1st set registered
    watch.stop();      // 2nd set registered
    watch.start();
    watch.restart();   // 3rd set registered
    watch.stop();      // 4th set registeredd

    expect(watch.sets.size).toEqual(4);
  });

  it('Should format a WatchSet', () => {
    const watch = new StopWatch();

    watch.start();
    watch.restart();   // 1st set registered
    watch.stop();      // 2nd set registered

    const firstSet = watch.getWatchSet(0);
    const secondSet = watch.getWatchSet(1);

    expect(firstSet instanceof WatchSet).toBeTruthy();
    expect(secondSet instanceof WatchSet).toBeTruthy();
  });

  it('Should format time diff to nearest appropriate time', () => {
    const expected = '4.5s';

    const startDate = new Date('2000-01-01');
    const endDate = new Date('2000-01-01');
    endDate.setMilliseconds(4500);

    const watch = new StopWatch();
    watch.begin = startDate.getTime();
    watch.end = endDate.getTime();

    const result = watch.toString();

    expect(result).toEqual(expected);
  });

  it('Should format time diff with different unit measures', () => {
    const expectedMilliseconds = '3600000.0ms';
    const expectedSeconds = '3600.0s';
    const expectedMinutes = '60.0min';
    const expectedHours = '1.0h';

    const startDate = new Date('2000-01-01');
    const endDate = new Date('2000-01-01');
    endDate.setMilliseconds(3600000);

    const watch = new StopWatch();
    watch.begin = startDate.getTime();
    watch.end = endDate.getTime();

    const resultMilliseconds = watch.toString('ms');
    const resultSeconds = watch.toString('s');
    const resultMinutes = watch.toString('m');
    const resultHours = watch.toString('H');

    expect(resultMilliseconds).toEqual(expectedMilliseconds);
    expect(resultSeconds).toEqual(expectedSeconds);
    expect(resultMinutes).toEqual(expectedMinutes);
    expect(resultHours).toEqual(expectedHours);
  });

  it('Should save the current set', () => {
    const watch = new StopWatch();
    watch.begin = +new Date(2000,1,1,17,0,0);
    watch.end = +new Date(2000,1,1,17,0,500); // diff 500ms
    watch.saveSet();

    const currentSet = watch.getWatchSet(0);

    expect(watch.sets.size).toBe(1);
    expect(currentSet.isEqual(watch));
  });
});
