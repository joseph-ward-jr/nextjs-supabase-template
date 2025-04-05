-- Create profiles table to store user-specific data
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,

  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
-- See [https://supabase.com/docs/guides/auth/row-level-security](https://supabase.com/docs/guides/auth/row-level-security)
alter table public.profiles
  enable row level security;

-- Allow public read access to profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

-- Allow users to insert their own profile
create policy "Users can insert their own profile." on public.profiles
  for insert with check ((select auth.uid()) = id);

-- Allow users to update their own profile
create policy "Users can update own profile." on public.profiles
  for update using ((select auth.uid()) = id);

-- Function to automatically create a profile entry when a new user signs up
-- See [https://supabase.com/docs/guides/auth/managing-user-data#using-triggers](https://supabase.com/docs/guides/auth/managing-user-data#using-triggers)
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insert a new row into public.profiles, taking username/avatar from metadata if available
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'user_name', -- Adjust if your metadata uses a different key
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger the function after a new user is created in auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Optional: Secure the handle_new_user function to prevent misuse
-- Revoke execution rights from public and grant only to the authenticated role or a specific service role if needed.
-- revoke execute on function public.handle_new_user from public;
-- grant execute on function public.handle_new_user to authenticated;


-- Optional: Set up Storage bucket for avatars (uncomment if needed)
-- Requires Storage to be enabled in your Supabase project.
/*
-- Insert a bucket "avatars" if it doesn't exist
insert into storage.buckets (id, name, public)
select 'avatars', 'avatars', true
where not exists (select 1 from storage.buckets where id = 'avatars');

-- Allow public read access to files in the 'avatars' bucket
create policy "Avatar images are publicly accessible." on storage.objects
  for select using (bucket_id = 'avatars');

-- Allow authenticated users to upload files to the 'avatars' bucket
create policy "Authenticated users can upload an avatar." on storage.objects
  for insert to authenticated with check (bucket_id = 'avatars');

-- Allow users to update their own avatar (checks ownership based on metadata or path)
-- This policy assumes the file path includes the user's ID or you set owner metadata.
create policy "Users can update their own avatar." on storage.objects
  for update to authenticated using ((select auth.uid())::text = (storage.foldername(name))[1]) -- Assumes path like 'user-id/avatar.png'
  with check (bucket_id = 'avatars');

-- Allow users to delete their own avatar
create policy "Users can delete their own avatar." on storage.objects
  for delete to authenticated using ((select auth.uid())::text = (storage.foldername(name))[1]); -- Assumes path like 'user-id/avatar.png'
*/
