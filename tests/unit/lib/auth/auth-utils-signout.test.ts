import { signOut } from '@/lib/auth/auth-utils';

// Mock the Supabase client
const mockSignOut = jest.fn();
const mockAuth = { signOut: mockSignOut };
const mockSupabaseClient = { auth: mockAuth };

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('signOut', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up the mock to return a successful response
    mockSignOut.mockResolvedValue({
      error: null
    });
  });

  it('should call Supabase auth.signOut', async () => {
    // Act
    const result = await signOut();

    // Assert
    expect(mockSignOut).toHaveBeenCalled();
    expect(result).toEqual({ error: null });
  });
});
