module.exports = {
  '*.{js,jsx}': [
    'eslint --fix',
    'prettier --write'
  ],
  '*.{json,md}': [
    'prettier --write'
  ],
  '*.{js,jsx,json,md}': [
    'npm run lint'
  ]
};
