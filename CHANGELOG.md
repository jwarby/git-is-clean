# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [3.0.1](https://gitlab.com/warby/git-is-clean/compare/v3.0.0...v3.0.1) (2019-07-16)


### Bug Fixes

* Wrong property name being used when calling isSubmodule function ([9892109](https://gitlab.com/warby/git-is-clean/commit/9892109))



## [3.0.0](https://gitlab.com/warby/git-is-clean/compare/v2.0.0...v3.0.0) (2019-07-16)


### Bug Fixes

* **dependencies:** Run 'npm audit fix' to upgrade version of lodash used by dependencies ([8282a1a](https://gitlab.com/warby/git-is-clean/commit/8282a1a))


### Features

* Ignore submodules by default, add option to include them ([d2d3ea8](https://gitlab.com/warby/git-is-clean/commit/d2d3ea8))


### BREAKING CHANGES

* submodules are now ignored by default; to restore the old
behaviour, use the --include-submodules flag or includeSubmodules: true API
option.



## [2.0.0](https://gitlab.com/warby/git-is-clean/compare/v1.0.0...v2.0.0) (2019-07-11)


### Features

* **cli:** Print list of offending files when command fails (a la 'git status --short') ([33569ce](https://gitlab.com/warby/git-is-clean/commit/33569ce))


### BREAKING CHANGES

* **cli:** list of offending files is now printed by default when the
command fails; use one of the following new flags to turn off this behaviour:
`--quiet`, `-q` or `--silent`



## 1.0.0 (2019-07-10)
