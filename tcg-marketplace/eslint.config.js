// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const plugin = require('tailwindcss');

module.exports = {
  extends: ['expo', 'prettier'],
  plugins: ['prettier', 'tailwindcss'],
  rules: {
    'prettier/prettier': 'error',
  },
};
