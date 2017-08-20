# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## [0.2.2] (2017-08-20)

#### :bug: Bug Fix
* `rear-core`
  * [#7](https://github.com/rearjs/rear/pull/7) Fix a rear-error issue with
  stack trace being captured before message
  ([@erremauro](https://github.com/erremauro))

#### :rocket: Enhancement
* `rear-core`
  * [#15](https://github.com/rearjs/rear/pull/15) Update runFlow and runLint to
  use optional bin path. ([@erremauro](https://github.com/erremauro))
  * [#10](https://github.com/rearjs/rear/pull/10) Add a StopWatch to rear-core. ([@erremauro](https://github.com/erremauro))
  * [#9](https://github.com/rearjs/rear/pull/9) Add size-reader to rear-core to
  read and diff files or directories sizes.
  ([@erremauro](https://github.com/erremauro))

#### :memo: Documentation
* `rear-core`
  * [#17](https://github.com/rearjs/rear/pull/17) Update runFlow and runLint
  documentation in rear-core. ([@erremauro](https://github.com/erremauro))
  * [#6](https://github.com/rearjs/rear/pull/6) Fix rear-core utilities listed
  in README.md. ([@erremauro](https://github.com/erremauro))

#### :house: Internal
* `rear-core`
  * [#14](https://github.com/rearjs/rear/pull/14) Update rear-core useYarn to
  check for yarn.lock. ([@erremauro](https://github.com/erremauro))
  * [#8](https://github.com/rearjs/rear/pull/8) Fix an issue with
  runtime-require when rear-core module is symlinked.
  ([@erremauro](https://github.com/erremauro))
* Other
  * [#13](https://github.com/rearjs/rear/pull/13) Add husky, linst-staged and
  bootstrap scripts to the project. ([@erremauro](https://github.com/erremauro))

## [0.2.0] (2017-08-14)

#### :rocket: New Feature
* `rear-core`
  * [#4](https://github.com/rearjs/rear/pull/4) Add core modules to rear-core
  ([@erremauro](https://github.com/erremauro))

[0.2.2]: https://github.com/rearjs/rear/compare/v0.2.0...v0.2.2
[0.2.0]: https://github.com/rearjs/rear/compare/v0.1.4...v0.2.0
