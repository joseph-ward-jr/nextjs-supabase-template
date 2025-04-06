import { createClient } from '@/lib/supabase/client'; // Using alias based on tsconfig
import { SupabaseClient } from '@supabase/supabase-js';

// Mock the core @supabase/ssr module if needed, though for this test, controlling env vars is key
// jest.mock('@supabase/ssr'); // Not strictly necessary here as we test the wrapper

// Store original process.env
const originalEnv = process.env;

describe('createClient (Browser Supabase Client Utility)', () => {

  beforeEach(() => {
    // Reset process.env before each test to ensure isolation
    jest.resetModules(); // Clears module cache, important for env changes
    process.env = { ...originalEnv }; // Restore original env vars
  });

  afterAll(() => {
    // Restore original process.env after all tests
    process.env = originalEnv;
  });

  it('should throw an error if NEXT_PUBLIC_SUPABASE_URL is missing', () => {
    // Arrange: Delete the required env var
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Act & Assert: Expect createClient to throw
    expect(() => createClient()).toThrow('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  });

  it('should throw an error if NEXT_PUBLIC_SUPABASE_ANON_KEY is missing', () => {
    // Arrange: Delete the required env var
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test-url.com';
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Act & Assert: Expect createClient to throw
    expect(() => createClient()).toThrow('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
  });

  it('should return a SupabaseClient instance when env vars are present', () => {
    // Arrange: Set the required env vars
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://test-url.com';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

    // Act: Call the function
    const client = createClient();

    // Assert: Check if the returned object looks like a Supabase client
    // We expect an object that includes methods like 'auth', 'from', etc.
    expect(client).toBeDefined();
    // Check for specific SupabaseClient class if possible/reliable after mocking/imports
    // A less brittle check might be for expected properties/methods:
    expect(typeof client.auth).toBe('object');
    expect(typeof client.from).toBe('function');
    // Add more checks if needed, e.g., client.rpc
  });

  // Optional: Add test for singleton behavior if relevant, though createBrowserClient handles this
});