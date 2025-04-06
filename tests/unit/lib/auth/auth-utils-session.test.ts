import { getSession } from '@/lib/auth/auth-utils';

// Mock the Supabase client
const mockGetSession = jest.fn();
const mockAuth = { getSession: mockGetSession };
const mockSupabaseClient = { auth: mockAuth };

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('getSession', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up the mock to return a successful response with a session
    mockGetSession.mockResolvedValue({
      data: { 
        session: { 
          user: { id: 'user-123', email: 'test@example.com' },
          expires_at: Date.now() + 3600
        } 
      },
      error: null
    });
  });

  it('should call Supabase auth.getSession', async () => {
    // Act
    const result = await getSession();

    // Assert
    expect(mockGetSession).toHaveBeenCalled();
    expect(result.data).toBeDefined();
    expect(result.data.session).toBeDefined();
    expect(result.error).toBeNull();
  });
});
