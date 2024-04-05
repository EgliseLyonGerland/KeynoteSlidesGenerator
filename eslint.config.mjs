import antfu from '@antfu/eslint-config';

export default antfu({
  ignores: ['dist'],
  rules: {
    'curly': ['error', 'all'],
    'no-console': 'off',
    'node/prefer-global/process': 'off',
    'style/semi': ['error', 'always'],
    'style/max-statements-per-line': ['error', { max: 2 }],
  },
});
