/**
 * Database interactions for blog posts
 */
import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

/**
 * Type definition for blog post creation
 */
export type BlogPostCreate = {
  title: string;
  content: string;
  slug: string;
  published?: boolean;
};

/**
 * Get a blog post by its slug
 * @param slug The unique slug of the blog post
 * @returns The blog post data or null if not found
 */
export async function getBlogPostBySlug(slug: string) {
  const supabase = createServerClient();
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
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
    `)
    .eq('slug', slug)
    .single();
  
  if (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
  
  return data;
}

/**
 * Create a new blog post
 * @param blogPost The blog post data to create
 * @returns The created blog post data or null if creation failed
 */
export async function createBlogPost(blogPost: BlogPostCreate) {
  const supabase = createServerClient();
  
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('User not authenticated');
    return null;
  }
  
  const { data, error } = await supabase
    .from('blog_posts')
    .insert({
      title: blogPost.title,
      content: blogPost.content,
      slug: blogPost.slug,
      published: blogPost.published ?? false,
      author_id: user.id
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating blog post:', error);
    return null;
  }
  
  return data;
}
