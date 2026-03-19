module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{scss,css}': [
    'stylelint --fix',
    'prettier --write'
  ],
  '*.{json,md}': [
    'prettier --write'
  ],
  '*.{ts,tsx,js,jsx,scss,css}': [
    'npm run lint'
  ]
};
