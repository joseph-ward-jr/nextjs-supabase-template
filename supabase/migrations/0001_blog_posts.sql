-- Create blog_posts table to store blog content
create table public.blog_posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references public.profiles(id) not null,
  title text not null,
  content text not null,
  slug text unique not null,
  published boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Set up Row Level Security (RLS)
alter table public.blog_posts
  enable row level security;

-- Allow public read access to published blog posts
create policy "Published blog posts are viewable by everyone." on public.blog_posts
  for select using (published = true);

-- Allow users to view their own unpublished posts
create policy "Users can view their own unpublished posts." on public.blog_posts
  for select using (author_id = auth.uid());

-- Allow users to insert their own posts
create policy "Users can insert their own posts." on public.blog_posts
  for insert with check (author_id = auth.uid());

-- Allow users to update their own posts
create policy "Users can update their own posts." on public.blog_posts
  for update using (author_id = auth.uid());

-- Allow users to delete their own posts
create policy "Users can delete their own posts." on public.blog_posts
  for delete using (author_id = auth.uid());

-- Function to automatically update the updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger the function before a blog post is updated
create trigger on_blog_post_update
  before update on public.blog_posts
  for each row execute procedure public.handle_updated_at();
