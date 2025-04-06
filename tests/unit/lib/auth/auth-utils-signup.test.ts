import { signUpWithPassword } from '@/lib/auth/auth-utils';

// Mock the Supabase client
const mockSignUp = jest.fn();
const mockAuth = { signUp: mockSignUp };
const mockSupabaseClient = { auth: mockAuth };

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('signUpWithPassword', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up the mock to return a successful response
    mockSignUp.mockResolvedValue({
      data: { session: null, user: { email: 'test@example.com' } },
      error: null
    });
  });

  it('should call Supabase auth.signUp with correct parameters', async () => {
    // Arrange
    const email = 'test@example.com';
    const password = 'password123';

    // Act
    await signUpWithPassword(email, password);

    // Assert
    expect(mockSignUp).toHaveBeenCalledWith({
      email,
      password
    });
  });
});
