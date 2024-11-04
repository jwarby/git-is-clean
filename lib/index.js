const fs = require('fs')
const path = require('path')

const createDebugger = require('debug')
const simpleGit = require('simple-git')

const pkg = require('../package.json')

const statuses = require('./statuses')

const debug = createDebugger(pkg.name)

const isSubmodule = pathname => {
  try {
    fs.accessSync(path.join(pathname, '.git'))
    return true
  } catch (e) {
    return false
  }
}

const getFiles = async (options = {}) => {
  debug('options: %o', options)

  const cwd = process.cwd()
  const { dir = cwd } = options

  const popd = () => process.chdir(cwd)

  debug('changing directory to %s', dir)
  process.chdir(dir)

  debug('running simple-git status')

  let files = (await simpleGit(process.cwd()).status()).files.map(f => ({
    ...f,
    index: f.index.trim(),
    workingTree: f.working_dir.trim(),
    isSubmodule: isSubmodule(f.path)
  }))

  debug('initial file list: %s', JSON.stringify(files, null, 2))

  if (!options.includeSubmodules) {
    debug(
      'includeSubmodules option not provided or false, filtering out submodules'
    )
    files = files.filter(({ isSubmodule }) => !isSubmodule)
  }

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

  files = files.map(f => ({
    ...f,
    index: f.isSubmodule ? f.index.toLowerCase() : f.index,
    workingTree: f.isSubmodule ? f.workingTree.toLowerCase() : f.workingTree
  }))

  debug('final files list: %s', JSON.stringify(files, null, 2))

  return files
}

const isClean = async (...args) => (await getFiles(...args)).length === 0

module.exports = isClean
module.exports.getFiles = getFiles
