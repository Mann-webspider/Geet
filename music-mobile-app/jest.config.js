module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      [
        'jest-expo',
        'expo',
        'expo-.*',
        '@expo',
        'react-native',
        '@react-native',
        '@react-navigation',
        '@react-native-async-storage',
      ].join('|') +
      ')/)',
  ],
};
