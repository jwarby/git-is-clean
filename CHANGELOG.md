# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0](https://gitlab.com/warby/git-is-clean/compare/v1.0.0...v2.0.0) (2019-07-11)


### Features

* **cli:** Print list of offending files when command fails (a la 'git status --short') ([33569ce](https://gitlab.com/warby/git-is-clean/commit/33569ce))


### BREAKING CHANGES

* **cli:** list of offending files is now printed by default when the
command fails; use one of the following new flags to turn off this behaviour:
`--quiet`, `-q` or `--silent`



## 1.0.0 (2019-07-10)
