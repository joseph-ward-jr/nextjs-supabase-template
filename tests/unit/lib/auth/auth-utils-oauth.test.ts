import { signInWithOAuth } from '@/lib/auth/auth-utils';

// Mock the Supabase client
const mockSignInWithOAuth = jest.fn();
const mockAuth = { signInWithOAuth: mockSignInWithOAuth };
const mockSupabaseClient = { auth: mockAuth };

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('signInWithOAuth', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up the mock to return a successful response
    mockSignInWithOAuth.mockResolvedValue({
      data: { provider: 'google', url: 'https://supabase.auth/v1/authorize?provider=google' },
      error: null
    });
  });

  it('should call Supabase auth.signInWithOAuth with default redirect URL', async () => {
    // Act
    await signInWithOAuth('google');

    // Assert
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: '/auth/callback',
      }
    });
  });

  it('should call Supabase auth.signInWithOAuth with custom redirect URL when provided', async () => {
    // Arrange
    const customRedirectUrl = 'https://example.com/custom-callback';
    
    // Act
    await signInWithOAuth('google', customRedirectUrl);

    // Assert
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: customRedirectUrl,
      }
    });
  });
});
