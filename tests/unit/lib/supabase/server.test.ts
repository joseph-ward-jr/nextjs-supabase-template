import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// Mock the next/headers module
jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

// Mock the @supabase/ssr module
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn((url, key, options) => {
    // Return a mock Supabase client with minimal structure for testing
    return {
      auth: {
        getSession: jest.fn(),
        getUser: jest.fn(),
      },
      from: jest.fn(() => ({
        select: jest.fn(),
      })),
      url,
      options: options || {}, // Ensure options is always defined
    };
  }),
}));

// Store original process.env
const originalEnv = process.env;

describe('createServerClient (Server Supabase Client Utility)', () => {
  // Mock cookie store implementation
  const mockCookieStore = {
    get: jest.fn((name) => ({ value: `mock-cookie-${name}` })),
    set: jest.fn(),
  };

  beforeEach(() => {
    // Reset process.env before each test
    jest.resetModules();
    process.env = { ...originalEnv };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set up the mock cookie store for each test
    (cookies as jest.Mock).mockReturnValue(mockCookieStore);
  });

  afterAll(() => {
    // Restore original process.env after all tests
    process.env = originalEnv;
  });

  it('should throw an error if NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    // Arrange: Delete the required env var
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Act & Assert: Expect createServerClient to throw
    expect(() => createServerClient()).toThrow('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  });

  it('should throw an error if NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    // Arrange: Delete the required env var
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test-url.com';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Act & Assert: Expect createServerClient to throw
    expect(() => createServerClient()).toThrow('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
  });

  it('should return a Supabase client with cookie handlers when env vars are present', () => {
    // Arrange: Set the required env vars
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test-url.com';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Act: Call the function
    const client = createServerClient();

    // Assert: Check if cookies() was called to get the cookie store
    expect(cookies).toHaveBeenCalled();
    
    // Check if the returned object looks like a Supabase client
    expect(client).toBeDefined();
    expect(typeof client.auth).toBe('object');
    expect(typeof client.from).toBe('function');
    
    // Test the cookie handlers by simulating their usage
    
    // 1. Test the get handler
    // Use type assertion to access the internal options property
    const cookieOptions = (client as any).options.cookies;
    const testCookieName = 'supabase-auth-token';
    cookieOptions.get(testCookieName);
    expect(mockCookieStore.get).toHaveBeenCalledWith(testCookieName);
    
    // 2. Test the set handler
    cookieOptions.set('test-cookie', 'test-value', { path: '/' });
    expect(mockCookieStore.set).toHaveBeenCalledWith({
      name: 'test-cookie',
      value: 'test-value',
      path: '/',
    });
    
    // 3. Test the remove handler (which uses set with empty value)
    cookieOptions.remove('test-cookie', { path: '/' });
    expect(mockCookieStore.set).toHaveBeenCalledWith({
      name: 'test-cookie',
      value: '',
      path: '/',
    });
  });

  it('should handle errors when setting cookies in a Server Component context', () => {
    // Arrange: Set up env vars and make the cookie set method throw an error
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test-url.com';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
    
    mockCookieStore.set.mockImplementationOnce(() => {
      throw new Error('Cannot set cookies in a Server Component');
    });
    
    // Spy on console.warn
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    // Act: Create client and try to set a cookie
    const client = createServerClient();
    
    // This should not throw despite the mock throwing
    // Use type assertion to access the internal options property
    (client as any).options.cookies.set('test-cookie', 'test-value', { path: '/' });
    
    // Assert: Check that the error was caught and warning was logged
    expect(consoleWarnSpy).toHaveBeenCalled();
    
    // Restore console.warn
    consoleWarnSpy.mockRestore();
  });
});
