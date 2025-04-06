import { getQueue, addJob, processQueue, closeAllQueues } from '@/lib/redis/queue';
import Bull from 'bull';

// Mock Bull
const mockAdd = jest.fn().mockResolvedValue({ id: 'job-123' });
const mockProcess = jest.fn();
const mockClose = jest.fn().mockResolvedValue(undefined);

jest.mock('bull', () => {
  return jest.fn().mockImplementation(() => ({
    add: mockAdd,
    process: mockProcess,
    close: mockClose
  }));
});

describe('Queue Utility', () => {
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
    // Clean up by closing all queue connections
    await closeAllQueues();
  });

  afterAll(() => {
    // Restore the original environment
    process.env = originalEnv;
  });

  it('should throw an error if REDIS_URL is not set', () => {
    // Arrange
    delete process.env.REDIS_URL;

    // Act & Assert
    expect(() => getQueue('test-queue')).toThrow('Missing env.REDIS_URL');
  });

  it('should create a new queue with the correct name and URL', () => {
    // Arrange
    const queueName = 'test-queue';
    const mockRedisUrl = 'redis://localhost:6379';
    process.env.REDIS_URL = mockRedisUrl;

    // Act
    const queue = getQueue(queueName);

    // Assert
    expect(Bull).toHaveBeenCalledWith(queueName, mockRedisUrl);
    expect(queue).toBeDefined();
  });

  it('should return the same queue instance on subsequent calls', () => {
    // Arrange
    const queueName = 'test-queue';
    process.env.REDIS_URL = 'redis://localhost:6379';

    // Act
    const queue1 = getQueue(queueName);
    const queue2 = getQueue(queueName);

    // Assert
    expect(Bull).toHaveBeenCalledTimes(1);
    expect(queue1).toBe(queue2);
  });

  describe('addJob', () => {
    beforeEach(() => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      jest.clearAllMocks();
    });

    it('should add a job to the specified queue', async () => {
      // Arrange
      const queueName = 'test-queue';
      const jobData = { task: 'test-task' };

      // Act
      const result = await addJob(queueName, jobData);

      // Assert
      expect(Bull).toHaveBeenCalledWith(queueName, process.env.REDIS_URL);
      expect(mockAdd).toHaveBeenCalledWith(jobData, undefined);
      expect(result).toEqual({ id: 'job-123' });
    });

    it('should add a job with options when provided', async () => {
      // Arrange
      const queueName = 'test-queue';
      const jobData = { task: 'test-task' };
      const jobOptions = { delay: 1000, attempts: 3 };

      // Act
      await addJob(queueName, jobData, jobOptions);

      // Assert
      expect(mockAdd).toHaveBeenCalledWith(jobData, jobOptions);
    });
  });

  describe('processQueue', () => {
    beforeEach(() => {
      process.env.REDIS_URL = 'redis://localhost:6379';
      jest.clearAllMocks();
    });

    it('should register a processor for the specified queue', () => {
      // Arrange
      const queueName = 'test-queue';
      const processor = jest.fn().mockResolvedValue('result');

      // Act
      processQueue(queueName, processor);

      // Assert
      expect(Bull).toHaveBeenCalledWith(queueName, process.env.REDIS_URL);
      expect(mockProcess).toHaveBeenCalled();
    });

    it('should call the processor with job data when a job is processed', async () => {
      // Arrange
      const queueName = 'test-queue';
      const processor = jest.fn().mockResolvedValue('result');
      const jobData = { task: 'test-task' };
      
      // Setup the process mock to call the callback with a job
      mockProcess.mockImplementation((callback) => {
        callback({ data: jobData });
      });

      // Act
      processQueue(queueName, processor);

      // Assert
      expect(processor).toHaveBeenCalledWith(jobData);
    });
  });
});
