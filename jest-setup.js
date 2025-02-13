// Set up environment variables for testing
process.env.NODE_ENV = 'test';

// Mock Redis
jest.mock('ioredis', () => {
  const Redis = require('ioredis-mock');
  return Redis;
});

// Mock Kafka
jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    producer: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    }),
    consumer: jest.fn().mockReturnValue({
      connect: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockResolvedValue(undefined),
      run: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn().mockResolvedValue(undefined),
    }),
  })),
}));

// Mock AWS SDK
jest.mock('aws-sdk', () => ({
  S3: jest.fn().mockImplementation(() => ({
    upload: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({ Location: 'https://mock-s3-url.com' }),
    }),
    getObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({ Body: Buffer.from('mock-file-content') }),
    }),
    deleteObject: jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    }),
  })),
}));

// Global test setup
beforeAll(() => {
  // Add any global setup here
});

// Global test teardown
afterAll(() => {
  // Add any global teardown here
});

// Reset mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});