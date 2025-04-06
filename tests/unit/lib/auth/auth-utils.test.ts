import { signInWithPassword } from '@/lib/auth/auth-utils';

// Mock the Supabase client
const mockSignInWithPassword = jest.fn();
const mockAuth = { signInWithPassword: mockSignInWithPassword };
const mockSupabaseClient = { auth: mockAuth };

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('signInWithPassword', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up the mock to return a successful response
    mockSignInWithPassword.mockResolvedValue({
      data: { session: {}, user: {} },
      error: null
    });
  });

  it('should call Supabase auth.signInWithPassword with correct parameters', async () => {
    // Arrange
    const email = 'test@example.com';
    const password = 'password123';

    // Act
    await signInWithPassword(email, password);

    // Assert
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email,
      password
    });
  });
});
