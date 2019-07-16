/* eslint-env mocha */
const expect = require('expect')
const mockery = require('mockery')

const MODULE = '../'
const MOCK_FILES = {
  staged: {
    file: '/path/to/staged',
    index: 'M',
    workingTree: ' '
  },
  unstaged: {
    file: '/path/to/unstaged',
    index: ' ',
    workingTree: 'M'
  },
  untracked: {
    file: '/path/to/untracked',
    index: '?',
    workingTree: '?'
  },
  submodule_modified: {
    file: '/path/to/submodule',
    index: ' ',
    workingTree: 'M'
  },
  submodule_untracked: {
    file: '/path/to/submodule',
    index: ' ',
    workingTree: '?'
  },
  submodule_clean: {
    file: '/path/to/submodule',
    index: ' ',
    workingTree: '?'
  }
}

mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false,
  useCleanCache: true
})

const setup = statuses => {
  const mock = () => Promise.resolve(statuses)

  mockery.registerMock('g-status', mock)

  return require(MODULE)
}

const mockFs = isSubmodule => {
  mockery.deregisterMock('fs')
  mockery.registerMock('fs', {
    accessSync: () => {
      if (!isSubmodule) throw new Error('not accessible')
    }
  })

  return () => mockery.deregisterMock('fs')
}

const postprocess = file => ({
  ...file,
  index: file.index.trim(),
  workingTree: file.workingTree.trim(),
  isSubmodule: false
})

describe('git-is-clean', () => {
  beforeEach(() => {
    mockery.resetCache()
  })

  describe('#getFiles()', () => {
    describe('with no filtering options', () => {
      it('should return the list of files from g-status', async () => {
        const files = [
          MOCK_FILES.staged,
          MOCK_FILES.unstaged,
          MOCK_FILES.untracked
        ]
        const { getFiles } = setup(files)

        expect(await getFiles()).toEqual(files.map(postprocess))
      })
    })

    describe('with "ignore" filtering options', () => {
      it('should exclude untracked files when ignoreUntracked: true', async () => {
        const files = [
          MOCK_FILES.staged,
          MOCK_FILES.unstaged,
          MOCK_FILES.untracked
        ]
        const { getFiles } = setup(files)

        expect(
          await getFiles({
            ignoreUntracked: true
          })
        ).toEqual([MOCK_FILES.staged, MOCK_FILES.unstaged].map(postprocess))
      })

      it('should exclude unstaged files when ignoreUnstaged: true', async () => {
        const files = [
          MOCK_FILES.staged,
          MOCK_FILES.unstaged,
          MOCK_FILES.untracked
        ]
        const { getFiles } = setup(files)

        expect(
          await getFiles({
            ignoreUnstaged: true
          })
        ).toEqual([MOCK_FILES.staged, MOCK_FILES.untracked].map(postprocess))
      })

      it('should exclude staged files when ignoreStaged: true', async () => {
        const files = [
          MOCK_FILES.staged,
          MOCK_FILES.unstaged,
          MOCK_FILES.untracked
        ]
        const { getFiles } = setup(files)

        expect(
          await getFiles({
            ignoreStaged: true
          })
        ).toEqual([MOCK_FILES.unstaged, MOCK_FILES.untracked].map(postprocess))
      })

      describe('multiple "ignore" filters', () => {
        it('should exclude unstaged and untracked changes when relevant options set', async () => {
          const files = [
            MOCK_FILES.staged,
            MOCK_FILES.unstaged,
            MOCK_FILES.untracked
          ]
          const { getFiles } = setup(files)

          expect(
            await getFiles({
              ignoreUnstaged: true,
              ignoreUntracked: true
            })
          ).toEqual([MOCK_FILES.staged].map(postprocess))
        })

        it('should exclude staged and unstaged changes when relevant options set', async () => {
          const files = [
            MOCK_FILES.staged,
            MOCK_FILES.unstaged,
            MOCK_FILES.untracked
          ]
          const { getFiles } = setup(files)

          expect(
            await getFiles({
              ignoreUnstaged: true,
              ignoreStaged: true
            })
          ).toEqual([MOCK_FILES.untracked].map(postprocess))
        })

        it('should exclude partially staged files when ignoreStaged: true', async () => {
          const files = [
            {
              path: '/path/to/partially-staged',
              index: 'M',
              workingTree: 'M'
            }
          ]
          const { getFiles } = setup(files)

          expect(
            await getFiles({
              ignoreStaged: true
            })
          ).toEqual([])
        })
      })
    })

    describe('with "only" filtering options', () => {
      it('should only return untracked files when onlyUntracked: true', async () => {
        const files = [
          MOCK_FILES.staged,
          MOCK_FILES.unstaged,
          MOCK_FILES.untracked
        ]
        const { getFiles } = setup(files)

        expect(
          await getFiles({
            onlyUntracked: true
          })
        ).toEqual([MOCK_FILES.untracked].map(postprocess))
      })

      it('should only return staged files when onlyStaged: true', async () => {
        const files = [
          MOCK_FILES.staged,
          MOCK_FILES.unstaged,
          MOCK_FILES.untracked
        ]
        const { getFiles } = setup(files)

        expect(
          await getFiles({
            onlyStaged: true
          })
        ).toEqual([MOCK_FILES.staged].map(postprocess))
      })

      it('should only return unstaged files when onlyUnstaged: true', async () => {
        const files = [
          MOCK_FILES.staged,
          MOCK_FILES.unstaged,
          MOCK_FILES.untracked
        ]
        const { getFiles } = setup(files)

        expect(
          await getFiles({
            onlyUnstaged: true
          })
        ).toEqual([MOCK_FILES.unstaged].map(postprocess))
      })
    })

    describe('with submodules', () => {
      it('should set isSubmodule to true and lower-case status for submodules', async () => {
        const unmockFs = mockFs(true)
        const { getFiles } = setup([MOCK_FILES.submodule_modified])

        const files = await getFiles({ includeSubmodules: true })

        expect(files).toEqual([
          {
            ...MOCK_FILES.submodule_modified,
            isSubmodule: true,
            index: '',
            workingTree: 'm'
          }
        ])

        unmockFs()
      })

      it('should filter out submodules by default', async () => {
        const unmockFs = mockFs(true)
        const { getFiles } = setup([MOCK_FILES.submodule_modified])

        expect(await getFiles()).toHaveLength(0)

        unmockFs()
      })
    })
  })

  describe('#isClean()', () => {
    it('should return true when no files are modified or untracked', async () => {
      const isClean = setup([])

      expect(await isClean()).toBe(true)
    })

    it('should return true if modified files are filtered out by options', async () => {
      const isClean = setup([MOCK_FILES.staged])

      expect(await isClean({ ignoreStaged: true })).toBe(true)
    })

    it('should return false if there are modified files', async () => {
      const isClean = setup([MOCK_FILES.staged, MOCK_FILES.unstaged])

      expect(await isClean()).toBe(false)
    })

    it('should return false if there are new, untracked files', async () => {
      const isClean = setup([MOCK_FILES.untracked])

      expect(await isClean()).toBe(false)
    })

    it('should return false if there are modified files not filtered out by options', async () => {
      const isClean = setup([MOCK_FILES.unstaged])

      expect(await isClean({ ignoreUntracked: true })).toBe(false)
    })

    describe('with submodules', () => {
      it('should return true if submodule has changes but includeSubmodules not set', async () => {
        const unmockFs = mockFs(true)
        const isClean = setup([MOCK_FILES.submodule_untracked])

        expect(await isClean()).toBe(true)
        unmockFs()
      })

      it('should return false if submodule has changes and includeSubmodules set', async () => {
        const unmockFs = mockFs(true)
        const isClean = setup([MOCK_FILES.submodule_untracked])

        expect(await isClean({ includeSubmodules: true })).toBe(false)
        unmockFs()
      })
    })
  })
})
