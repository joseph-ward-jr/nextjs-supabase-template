import { getBlogPostBySlug } from '@/lib/db/blog-posts';

// Mock the createServerClient function
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect.mockReturnThis(),
  eq: mockEq.mockReturnThis(),
  single: mockSingle
}));

const mockSupabaseClient = {
  from: mockFrom
};

// Mock the cookies function
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({ get: jest.fn() }))
}));

// Mock the createServerClient function
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => mockSupabaseClient)
}));

describe('getBlogPostBySlug', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return blog post data when found', async () => {
    // Arrange
    const mockBlogPost = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Blog Post',
      content: 'This is a test blog post content.',
      slug: 'test-blog-post',
      published: true,
      created_at: '2025-04-05T10:00:00.000Z',
      updated_at: '2025-04-05T10:00:00.000Z',
      author_id: '123e4567-e89b-12d3-a456-426614174001',
      profiles: {
        username: 'testuser',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.png'
      }
    };

    mockSingle.mockResolvedValue({
      data: mockBlogPost,
      error: null
    });

    // Act
    const result = await getBlogPostBySlug('test-blog-post');

    // Assert
    expect(mockFrom).toHaveBeenCalledWith('blog_posts');
    expect(mockSelect).toHaveBeenCalledWith(`
      id,
      title,
      content,
      slug,
      published,
      created_at,
      updated_at,
      author_id,
      profiles:author_id (
        username,
        full_name,
        avatar_url
      )
    `);
    expect(mockEq).toHaveBeenCalledWith('slug', 'test-blog-post');
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toEqual(mockBlogPost);
  });

  it('should return null when blog post is not found', async () => {
    // Arrange
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Blog post not found', code: 'PGRST116' }
    });

    // Act
    const result = await getBlogPostBySlug('non-existent-post');

    // Assert
    expect(mockFrom).toHaveBeenCalledWith('blog_posts');
    expect(mockEq).toHaveBeenCalledWith('slug', 'non-existent-post');
    expect(result).toBeNull();
  });
});
