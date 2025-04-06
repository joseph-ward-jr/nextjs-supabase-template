import { getCurrentUser } from '@/lib/auth/auth-utils';

// Mock the Supabase client
const mockGetUser = jest.fn();
const mockAuth = { getUser: mockGetUser };
const mockSupabaseClient = { auth: mockAuth };

// Mock the createClient function
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

describe('getCurrentUser', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return the user when authenticated', async () => {
    // Arrange
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    mockGetUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    // Act
    const result = await getCurrentUser();

    // Assert
    expect(mockGetUser).toHaveBeenCalled();
    expect(result).toEqual(mockUser);
  });

  it('should return null when no user is authenticated', async () => {
    // Arrange
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    // Act
    const result = await getCurrentUser();

    // Assert
    expect(mockGetUser).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
