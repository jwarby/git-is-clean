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
  }
}

mockery.enable({
  warnOnReplace: false,
  warnOnUnregistered: false
})

const setup = statuses => {
  const mock = () => Promise.resolve(statuses)

  mockery.registerMock('g-status', mock)

  delete require.cache[require.resolve(MODULE)]

  return require(MODULE)
}

const trimValues = file => ({
  ...file,
  index: file.index.trim(),
  workingTree: file.workingTree.trim()
})

describe('git-is-clean', () => {
  describe('#getFiles()', () => {
    describe('with no filtering options', () => {
      it('should return the list of files from g-status', async () => {
        const files = [
          MOCK_FILES.staged,
          MOCK_FILES.unstaged,
          MOCK_FILES.untracked
        ]
        const { getFiles } = setup(files)

        expect(await getFiles()).toEqual(files.map(trimValues))
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
        ).toEqual([MOCK_FILES.staged, MOCK_FILES.unstaged].map(trimValues))
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
        ).toEqual([MOCK_FILES.staged, MOCK_FILES.untracked].map(trimValues))
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
        ).toEqual([MOCK_FILES.unstaged, MOCK_FILES.untracked].map(trimValues))
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
          ).toEqual([MOCK_FILES.staged].map(trimValues))
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
          ).toEqual([MOCK_FILES.untracked].map(trimValues))
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
        ).toEqual([MOCK_FILES.untracked].map(trimValues))
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
        ).toEqual([MOCK_FILES.staged].map(trimValues))
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
        ).toEqual([MOCK_FILES.unstaged].map(trimValues))
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
  })
})
