/**
 * Queue utility for Redis
 * Provides functionality to create and manage job queues
 */
import Bull, { Queue, JobOptions } from 'bull';
import { getRedisClient } from './client';

// Map to store queue instances
const queues = new Map<string, Queue>();

/**
 * Create or get a queue instance
 * @param name The name of the queue
 * @returns The queue instance
 */
export function getQueue(name: string): Queue {
  if (queues.has(name)) {
    return queues.get(name)!;
  }

  // Check if environment variables are set
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    throw new Error('Missing env.REDIS_URL');
  }

  // Create a new queue
  const queue = new Bull(name, redisUrl);
  
  // Store the queue instance
  queues.set(name, queue);
  
  return queue;
}

/**
 * Add a job to a queue
 * @param queueName The name of the queue
 * @param data The data for the job
 * @param options Optional Bull job options
 * @returns The created job
 */
export async function addJob<T>(
  queueName: string, 
  data: T, 
  options?: JobOptions
) {
  const queue = getQueue(queueName);
  return await queue.add(data, options);
}

/**
 * Process jobs from a queue
 * @param queueName The name of the queue
 * @param processor The function to process jobs
 */
export function processQueue<T, R>(
  queueName: string,
  processor: (data: T) => Promise<R>
) {
  const queue = getQueue(queueName);
  
  queue.process(async (job) => {
    try {
      return await processor(job.data);
    } catch (error) {
      console.error(`Error processing job in queue ${queueName}:`, error);
      throw error;
    }
  });
}

/**
 * Close all queue connections
 * Useful for cleanup during application shutdown
 */
export async function closeAllQueues(): Promise<void> {
  for (const [name, queue] of queues.entries()) {
    await queue.close();
    queues.delete(name);
  }
}
