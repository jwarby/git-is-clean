# `git-is-clean`
> Check if a Git repository's index or working tree contains changes
> >  [![pipeline status](https://gitlab.com/warby/git-is-clean/badges/master/pipeline.svg)](https://gitlab.com/warby/git-is-clean/commits/master)  [![coverage report](https://gitlab.com/warby/git-is-clean/badges/master/coverage.svg)](https://gitlab.com/warby/git-is-clean/commits/master)

## Installation

```bash
npm install git-is-clean
```

Or, run with [`npx`][npx]:

```bash
npx git-is-clean
```

## Usage

### CLI

Without any arguments, `git-is-clean` will exit with status 0 if there are no
changes to either the Git index or the working tree, or status 1 if there are
(if any errors occur, the program will exit with status 2).

#### Ignoring certain file statuses

The behaviour can be customised to ignore one or more of staged, unstaged or
untracked files:

```bash
# Ignore any untracked files
git-is-clean --ignore-untracked

# Ignore any staged files
git-is-clean --ignore-staged

# Ignore any unstaged files
git-is-clean --ignore-unstaged

# Ignore any staged or unstaged files (ie only exit with status 1 if there are
# untracked files in the working tree):
git-is-clean --ignore-unstaged --ignore-staged
```

#### Only checking certain file statuses

Instead of specifying multiple `--ignore-*` options, you can use one of:

- `--only-staged` - equivalent to setting `--ignore-untracked` and `--ignore-unstaged`
- `--only-unstaged`: equivalent to setting `--ignore-untracked` and `--ignore-staged`
- `--only-untracked`: equivalent to setting `--ignore-staged` and `--ignore-unstaged`

Note that each of these options is mutually exclusive, and also imply that no
extra `--ignore-*` options are set.

#### Checking a different Git directory

By default, Git commands will execute in the current working directory.  Use the
`--dir` (or just `-d`) option to check a different directory:

```bash
git-is-clean --dir /tmp/my-repo
```

#### Checking if Git is dirty instead of clean

For convenience, this package also ships a `git-is-dirty` binary which is
identical to `git-is-clean` except with a flipped exit status:

```bash
git-is-clean; echo $?
1
git-is-dirty; echo $?
0
```

To run the `git-is-dirty` script through `npx`:

```bash
npx --package git-is-clean git-is-dirty
# OR:
npx -p git-is-clean git-is-dirty
```

### API

To use this is in other Node.js programs:

#### `isClean(options: {}) => Promise<boolean>`

Default export, which is a function that returns a `Promise` which resolves with
a boolean value.

```javascript
const isClean = require('git-is-clean')

isClean().then(clean => {
  console.log('Repository is clean')
})

// Using async/await syntax
;(async () => {
  const clean = await isClean()

  if (clean) {
    /* ...snip... */
  } else {
    /* ...snip... */
  }
})()
```

Options are the same as the CLI program, just camel-cased instead of
kebab-cased:

```javascript
isClean({
  ignoreUntracked: true
}).then(...)

// Is equivalent to:
// git-is-clean --ignore-untracked
```

#### `getFiles(options: {}) => Promise<Array<{}>>`

Returns the list of files that `isClean()` uses to determine cleanliness - if
the resolved array is empty, the repository is clean.

When populated, each entry in the resolved array will have the following shape:

```javascript
{
  path: 'path/to/file',
  index: '<git status short format>',
  workingTree: '<git status short format>'
}
```

For example, a tracked file with unstaged modifications would look like this:

```javascript
{
  path: 'myfile.js',
  index: '',
  workingTree: 'M'
}
```

For a list of the short code statuses, see
[`git-status` short format][git-status-short-format].

Again, options are the same as the CLI options except they are camel-cased
instead of kebab-cased.

### Debugging

Set the environment variable `DEBUG` to `git-is-clean` to debug the module:

```bash
DEBUG=git-is-clean git-is-clean
```

See the documentation for the [`debug` package][debug] for further debugging options.

## See also

- [`g-status`][g-status]: Underlying package used to get the list of
  staged/unstaged/untracked files.

[npx]: https://blog.scottlogic.com/2018/04/05/npx-the-npm-package-runner.html
[git-status-short-format]: https://git-scm.com/docs/git-status#_short_format
[g-status]: https://www.npmjs.com/package/g-status
[debug]: https://www.npmjs.com/package/debug
