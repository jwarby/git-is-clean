const tasks = arr => arr.join(' && ')

module.exports = {
  hooks: {
    'pre-commit': [
      // Ensure no unstaged changes or untracked files are present
      './bin/git-is-clean --ignore-staged || ' +
        '(shx echo "Unstaged changes or untracked files present!" && exit 1)',
      // Make sure files are formatted with prettier
      'npm run prettier -- --list-different',
      // ESLint
      'npm run lint',
      // Tests & coverage check
      'npm run check-coverage',
      // Check for security vulnerabilities in dependencies
      'npm audit',
      // Check for outdated modules
      'npm outdated'
    ].join(' && ')
  }
}
