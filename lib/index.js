const createDebugger = require('debug')
const gitStatus = require('g-status')

const pkg = require('../package.json')

const statuses = require('./statuses')

const debug = createDebugger(pkg.name)

const getFiles = async (options = {}) => {
  debug('options: %o', options)

  const cwd = process.cwd()
  const { dir = cwd } = options

  const popd = () => process.chdir(cwd)

  debug('changing directory to %s', dir)
  process.chdir(dir)

  debug('running g-status')
  let files = (await gitStatus()).map(f => ({
    ...f,
    index: f.index.trim(),
    workingTree: f.workingTree.trim()
  }))

  debug('initial file list: %s', JSON.stringify(files, null, 2))

  if (options.ignoreUntracked || options.onlyStaged || options.onlyUnstaged) {
    files = files.filter(({ index }) => index !== statuses.STATUS_UNTRACKED)
    debug(
      'filtered out untracked files, new list: %s',
      JSON.stringify(files, null, 2)
    )
  }

  if (options.ignoreStaged || options.onlyUnstaged || options.onlyUntracked) {
    files = files.filter(({ index }) =>
      [statuses.STATUS_UNMODIFIED, statuses.STATUS_UNTRACKED].includes(index)
    )

    debug(
      'filtered out staged files, new list: %s',
      JSON.stringify(files, null, 2)
    )
  }

  if (options.ignoreUnstaged || options.onlyStaged || options.onlyUntracked) {
    files = files.filter(
      ({ workingTree }) => workingTree !== statuses.STATUS_MODIFIED
    )
  }

  debug('returning to original directory %s', cwd)
  popd()

  debug('final files list: %s', JSON.stringify(files, null, 2))

  return files
}

const isClean = async (...args) => (await getFiles(...args)).length === 0

module.exports = isClean
module.exports.getFiles = getFiles
