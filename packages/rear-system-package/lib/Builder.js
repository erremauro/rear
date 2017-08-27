const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const deepmerge = require('deepmerge');
const {EventEmitter} = require('events');
const chokidar = require('chokidar');
const webpack = require('webpack');
const runFlow = require('rear-core/run-flow');
const runLint = require('rear-core/run-lint');
const formatWebpackMessages = require('rear-core/format-webpack-messages');
const transpile = require('rear-core/transpile');
const noop = require('rear-core/noop');
const {StopWatch} = require('rear-core/stop-watch');
const {diffSize} = require('rear-core/size-reader');

class Builder {
  constructor (props) {
    this.props = deepmerge(Object.assign({}, Builder.defaults), props);
    this.files = new Set();
    this.reporter = this.props.silent
      ? Builder.defaults.reporter
      : (props.reporter || Builder.defaults.reporter);

    this.state = {
      timer: new StopWatch()
    }

    process.on('unhandledRejection', this.handleError.bind(this));
  }

  build () {
    this.emit('start', handler => { if (handler) handler.apply(this); });
    this.watcher = chokidar.watch(this.props.root, this.props.watcherOptions);

    this.watcher.on('add', file => this.files.add(file));
    this.watcher.on('ready', this.createBuild.bind(this));
    this.watcher.on('change', this.createBuild.bind(this));
  }

  createBuild () {
    this.state.timer.start();

    const files = Array.from(this.files);
    if (!this.lint(files)) return this.emit('error');

    return this.typecheck()
      .then(() => {
        if (this.props.webpack) {
          return this.compile()
            .then(() => [
              path.join(
                this.props.transformConfig.output.path,
                this.props.transformConfig.output.filename
              )
            ])
        }
        return this.transform(files).then(() => files);
      })
      .then(this.compress.bind(this))
      .then(this.close.bind(this))
      .catch(this.handleError.bind(this));
  }

  close () {
    this.state.timer.stop();

    diffSize(this.props.root, this.props.dest)
      .then(result => {

        this.state.size = {
          root: result.sizeA,
          dest: result.sizeB,
          diff: result.diff,
          sign: result.sign
        };

        this.emit('close', this.state);
      })
      .catch(err => {
        this.emit('error', err)
      });

    if (!this.watcher || this.props.watch) return;
    this.watcher.close();
  }

  lint (files) {
    if (!this.props.lint) return true;
    this.emit('lint');
    return runLint(
      files,
      this.props.eslintConfig,
      this.reporter,
      this.props.eslintBin
    );
  }

  typecheck () {
    if (!this.props.typecheck) return Promise.resolve();
    this.emit('typecheck');
    return runFlow(this.props.flowBin).catch(err => {
      this.emit('error');
    });
  }

  transform (files) {
    if (!this.props.transform) return Promise.resolve();
    this.emit('transform');

    const transpileAll = files.map(file => transpile({
      file,
      src: this.props.root,
      dest: this.props.dest,
      babelOptions: this.props.transformConfig
    }));
    return Promise.all(transpileAll);
  }

  compile () {
    if (!this.props.transform) return Promise.resolve();
    this.emit('transform');

    const compiler = webpack(this.props.transformConfig);

    return new Promise((resolve, reject) => {
      compiler.run((err, stats) => {
        if (err) return reject(new Error(err.message));
        const messages = formatWebpackMessages(stats.toJson({}, true));
        if (messages.errors.length) {
          // Only keep the first error to let the user
          // resolve one issue at a time.
          if (messages.errors.length > 1) messages.errors.length = 1;
          return reject(new Error(messages.errors.join('\n\n')));
        }
        return resolve({stats, warnings: messages.warnings});
      });
    });
  }

  compress (files) {
    if (!this.props.compress) return Promise.resolve();
    this.emit('compress');
    const UglifyJS = require('uglify-es');
    const promises = files.map(file => {
      return new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
          if (err) return reject(err);

          const content = data.toString();
          const result = UglifyJS.minify(content, {
            compress: {
              passes: 2
            }
          });

          if (result.error) return reject(result.error);

          fs.writeFile(file, result.code, (err) => {
            if (err) return reject(err);
            return resolve();
          });
        })
      });
    });
    return Promise.all(promises);
  }

  handleError (err) {
    this.state.hasErrors = true;
    this.emit('error', err);
  }
}

Builder.defaults = {
  lint:      true,
  transform: true,
  typecheck: true,
  silent:    false,
  watch:     false,
  webpack:   false,
  compress:  false,
  flowBin:         undefined,
  eslintBin:       undefined,
  eslintConfig:    undefined,
  transformConfig: undefined,
  reporter: {
    log:       noop,
    highlight: noop,
    success:   noop,
    info:      noop,
    hint:      noop,
    error:     noop,
    warn:      noop
  },
  watcherOptions: {
    alwaysStat: true,
    usePolling: true,
    interval: 300,
    ignored: /((^|[/\\])\.|.+\.(?!(js*)$)([^.]+$))/
  }
}
util.inherits(Builder, EventEmitter);

module.exports = Builder;
