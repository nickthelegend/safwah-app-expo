// Jest setup — swap AsyncStorage for its in-memory mock so storage-backed
// modules (utils/activity) run without a native module.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
