import { getRedisClient, closeRedisConnection } from '@/lib/redis/client';
import Redis from 'ioredis';

// Mock ioredis
jest.mock('ioredis', () => {
  const mockOn = jest.fn();
  const mockQuit = jest.fn().mockResolvedValue(undefined);
  
  return jest.fn().mockImplementation(() => ({
    on: mockOn,
    quit: mockQuit
  }));
});

describe('Redis Client Utility', () => {
  // Save the original environment
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset the module registry before each test
    jest.resetModules();
    
    // Set up a clean process.env for each test
    process.env = { ...originalEnv };
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // Clean up by closing any Redis connections
    await closeRedisConnection();
  });

  afterAll(() => {
    // Restore the original environment
    process.env = originalEnv;
  });

  it('should throw an error if REDIS_URL is not set', () => {
    // Arrange
    delete process.env.REDIS_URL;

    // Act & Assert
    expect(() => getRedisClient()).toThrow('Missing env.REDIS_URL');
  });

  it('should create a new Redis client with the correct URL', () => {
    // Arrange
    const mockRedisUrl = 'redis://localhost:6379';
    process.env.REDIS_URL = mockRedisUrl;

    // Act
    const client = getRedisClient();

    // Assert
    expect(Redis).toHaveBeenCalledWith(mockRedisUrl);
    expect(client).toBeDefined();
  });

  it('should return the same Redis client on subsequent calls', () => {
    // Arrange
    process.env.REDIS_URL = 'redis://localhost:6379';

    // Act
    const client1 = getRedisClient();
    const client2 = getRedisClient();

    // Assert
    expect(Redis).toHaveBeenCalledTimes(1);
    expect(client1).toBe(client2);
  });
});
