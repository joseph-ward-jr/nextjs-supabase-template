import { createBlogPost, type BlogPostCreate } from '@/lib/db/blog-posts';

// Mock the Supabase client
const mockGetUser = jest.fn();
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();
const mockFrom = jest.fn(() => ({
  insert: mockInsert.mockReturnThis(),
  select: mockSelect.mockReturnThis(),
  single: mockSingle
}));

const mockAuth = {
  getUser: mockGetUser
};

const mockSupabaseClient = {
  from: mockFrom,
  auth: mockAuth
};

// Mock the createServerClient function
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => mockSupabaseClient)
}));

describe('createBlogPost', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should create a blog post when user is authenticated', async () => {
    // Arrange
    const userId = '123e4567-e89b-12d3-a456-426614174001';
    const newBlogPost: BlogPostCreate = {
      title: 'Test Blog Post',
      content: 'This is a test blog post content.',
      slug: 'test-blog-post',
      published: true
    };

    const createdBlogPost = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: newBlogPost.title,
      content: newBlogPost.content,
      slug: newBlogPost.slug,
      published: newBlogPost.published,
      created_at: '2025-04-05T10:00:00.000Z',
      updated_at: '2025-04-05T10:00:00.000Z',
      author_id: userId
    };

    // Mock getUser to return an authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null
    });

    // Mock insert to return the created blog post
    mockSingle.mockResolvedValue({
      data: createdBlogPost,
      error: null
    });

    // Act
    const result = await createBlogPost(newBlogPost);

    // Assert
    expect(mockGetUser).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith('blog_posts');
    expect(mockInsert).toHaveBeenCalledWith({
      title: newBlogPost.title,
      content: newBlogPost.content,
      slug: newBlogPost.slug,
      published: newBlogPost.published,
      author_id: userId
    });
    expect(mockSelect).toHaveBeenCalled();
    expect(mockSingle).toHaveBeenCalled();
    expect(result).toEqual(createdBlogPost);
  });

  it('should return null when user is not authenticated', async () => {
    // Arrange
    const newBlogPost: BlogPostCreate = {
      title: 'Test Blog Post',
      content: 'This is a test blog post content.',
      slug: 'test-blog-post'
    };

    // Mock getUser to return no authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    // Act
    const result = await createBlogPost(newBlogPost);

    // Assert
    expect(mockGetUser).toHaveBeenCalled();
    expect(mockFrom).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should return null when there is an error creating the blog post', async () => {
    // Arrange
    const userId = '123e4567-e89b-12d3-a456-426614174001';
    const newBlogPost: BlogPostCreate = {
      title: 'Test Blog Post',
      content: 'This is a test blog post content.',
      slug: 'test-blog-post'
    };

    // Mock getUser to return an authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null
    });

    // Mock insert to return an error
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Error creating blog post', code: 'PGRST116' }
    });

    // Act
    const result = await createBlogPost(newBlogPost);

    // Assert
    expect(mockGetUser).toHaveBeenCalled();
    expect(mockFrom).toHaveBeenCalledWith('blog_posts');
    expect(mockInsert).toHaveBeenCalledWith({
      title: newBlogPost.title,
      content: newBlogPost.content,
      slug: newBlogPost.slug,
      published: false,
      author_id: userId
    });
    expect(result).toBeNull();
  });
});
