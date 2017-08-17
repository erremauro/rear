const TimeFormats = {
  'ms': {
    stringValue: 'ms',
    rawValue: 1
  },
  's': {
    stringValue: 's',
    rawValue: 1000
  },
  'm': {
    stringValue: 'min',
    rawValue: 1000 * 60
  },
  'H': {
    stringValue: 'h',
    rawValue: 1000 * Math.pow(60, 2)
  }
}

class WatchSet {
  constructor (props) {
    this.begin = 0;
    this.end = 0;

    if (props) {
      this.begin = props.begin;
      this.end = props.end
    }
  }

  diff () {
    return this.end - this.begin;
  }

  isEqual (watchSet) {
    if (!(watchSet instanceof WatchSet)) {
      throw new TypeError(
        `watchSet must be a WatchSet. Received: ${typeof watchSet}`
      );
    }

    return this.begin === watchSet.begin && this.end === watchSet.end;
  }

  toString (format) {
    const value = this.diff();
    if (typeof format !== 'string') {
      format = nearestTimeFormat(value);
    }
    const timeFormat = TimeFormats[format] || TimeFormats['ms'];
    const timeDiff = (value / timeFormat.rawValue).toFixed(1);
    return `${timeDiff}${timeFormat.stringValue}`;
  }
}

class StopWatch extends WatchSet {
  constructor () {
    super(null);
    this.sets = new Set();
  }

  start () {
    this.begin = +new Date();
  }

  stop () {
    this.end = +new Date();
    this.saveSet();
  }

  restart () {
    this.stop();
    this.start();
  }

  reset () {
    this.begin = 0;
    this.end = 0;
    this.sets = new Set();
  }

  saveSet () {
    this.sets.add( new WatchSet({ begin: this.begin, end: this.end }) );
  }

  getWatchSet (index) {
    return [...this.sets][index];
  }
}

module.exports = {
  StopWatch,
  WatchSet
};

/////////////////////////

function nearestTimeFormat (value) {
  const keys = Object.keys(TimeFormats);
  for (let i = 0; i < keys.length; i++) {
    const next = TimeFormats[keys[i+1]];
    const current = TimeFormats[keys[i]];

    if (!next) return current.stringValue;
    if (value > next.rawValue) continue;

    return current.stringValue;
  }
  return TimeFormats['ms'].stringValue;
}
