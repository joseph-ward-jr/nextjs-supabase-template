import { resetPassword } from '@/lib/auth/auth-utils';

// Mock the Supabase client
const mockResetPasswordForEmail = jest.fn();
const mockAuth = { resetPasswordForEmail: mockResetPasswordForEmail };
const mockSupabaseClient = { auth: mockAuth };

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('resetPassword', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up the mock to return a successful response
    mockResetPasswordForEmail.mockResolvedValue({
      data: {},
      error: null
    });
  });

  it('should call Supabase auth.resetPasswordForEmail with default redirect URL', async () => {
    // Arrange
    const email = 'test@example.com';

    // Act
    await resetPassword(email);

    // Assert
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(email, {
      redirectTo: '/auth/reset-password/confirm'
    });
  });

  it('should call Supabase auth.resetPasswordForEmail with custom redirect URL when provided', async () => {
    // Arrange
    const email = 'test@example.com';
    const customRedirectUrl = 'https://example.com/custom-reset';
    
    // Act
    await resetPassword(email, customRedirectUrl);

    // Assert
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith(email, {
      redirectTo: customRedirectUrl
    });
  });
});
