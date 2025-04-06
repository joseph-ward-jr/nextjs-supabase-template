// src/lib/supabase/server.ts
import {
  createServerClient as _createServerClient,
  type CookieOptions,
} from '@supabase/ssr';
import { cookies } from 'next/headers';

// Define a function that creates a Supabase client for server-side contexts
// (Server Components, Route Handlers, Server Actions)
export function createServerClient() {
  // Check if environment variables are set
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseAnonKey) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  // Get the cookie store instance
  const cookieStore = cookies();

  // Create and return the Supabase client with cookie handling
  return _createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) {
        // In Next.js 15, there may be typing issues with cookies()
        try {
          // @ts-ignore - Handle potential Next.js typing issues
          return cookieStore.get(name)?.value;
        } catch (error) {
          console.error('Error accessing cookie:', error);
          return undefined;
        }
      },
      set(name, value, options) {
        try {
          // @ts-ignore - Handle potential Next.js typing issues
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          // This can be ignored if you have middleware refreshing sessions
          console.warn(
            `Attempted to set cookie '${name}' from a Server Component. This is a no-op. Ensure middleware handles session refresh.`,
            error
          );
        }
      },
      remove(name, options) {
        try {
          // @ts-ignore - Handle potential Next.js typing issues
          cookieStore.set({ name, value: '', ...options });
        } catch (error) {
          // This can be ignored if you have middleware refreshing sessions
          console.warn(
            `Attempted to remove cookie '${name}' from a Server Component. This is a no-op. Ensure middleware handles session refresh.`,
            error
          );
        }
      },
    },
  });
}

// Optional: Define createAdminClient later if needed for service_role operations
// It would typically not use the cookie helpers but directly use the service key.
/*
import { createClient as createAdmin } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL for admin client');
  }
  if (!serviceKey) {
    throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY for admin client');
  }

  // Create a Supabase client with the service role key for elevated privileges
  // Be extremely careful where this client is used!
  return createAdmin(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
*/