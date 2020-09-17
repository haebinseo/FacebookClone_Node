module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true,
    mocha: true,
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended'],
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'no-console': 'off',
    'no-param-reassign': ['error', { props: false }],
  },
};
