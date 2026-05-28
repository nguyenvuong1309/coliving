module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  transformIgnorePatterns: [
    'node_modules/.pnpm/(?!(react-native|@react-native\\+.*|@react-native-community\\+.*|react-native-.*|@react-navigation\\+.*|react-redux|redux|@reduxjs\\+toolkit|redux-saga|immer|reselect|@supabase\\+.*)@)',
    'node_modules/(?!\\.pnpm/|((jest-)?react-native|@react-native|@react-native-community|@react-navigation|react-native-.*|react-redux|redux|@reduxjs/toolkit|redux-saga|immer|reselect|@supabase)/)',
  ],
};
