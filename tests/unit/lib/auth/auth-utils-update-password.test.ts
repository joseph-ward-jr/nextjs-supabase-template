import { updatePassword } from '@/lib/auth/auth-utils';

// Mock the Supabase client
const mockUpdateUser = jest.fn();
const mockAuth = { updateUser: mockUpdateUser };
const mockSupabaseClient = { auth: mockAuth };

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('updatePassword', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up the mock to return a successful response
    mockUpdateUser.mockResolvedValue({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null
    });
  });

  it('should call Supabase auth.updateUser with the new password', async () => {
    // Arrange
    const newPassword = 'newSecurePassword123';

    // Act
    const result = await updatePassword(newPassword);

    // Assert
    expect(mockUpdateUser).toHaveBeenCalledWith({ password: newPassword });
    expect(result.data).toBeDefined();
    expect(result.error).toBeNull();
  });
});
