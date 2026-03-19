module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{css,scss}': [
    'stylelint --fix',
    'prettier --write'
  ],
  '*.{json,md}': [
    'prettier --write'
  ],
  '*.{ts,tsx,js,jsx,css,scss}': [
    'npm run lint'
  ]
};
