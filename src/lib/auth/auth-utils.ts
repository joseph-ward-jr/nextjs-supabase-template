/**
 * Authentication utilities for Supabase integration
 */
import { createClient } from '@/lib/supabase/client';
import { AuthError } from '@supabase/supabase-js';

/**
 * Sign in with email and password
 * @param email User's email address
 * @param password User's password
 * @returns Promise with the authentication response
 */
export async function signInWithPassword(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({
    email,
    password,
  });
}

/**
 * Sign up with email and password
 * @param email User's email address
 * @param password User's password
 * @returns Promise with the authentication response
 */
export async function signUpWithPassword(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
  });
}

/**
 * Sign in with OAuth provider (Google)
 * @param provider OAuth provider (currently only supports 'google')
 * @param redirectUrl Optional custom redirect URL (defaults to /auth/callback)
 * @returns Promise with the authentication response
 */
export async function signInWithOAuth(provider: 'google', redirectUrl?: string) {
  const supabase = createClient();
  
  // Determine the redirect URL
  let fullRedirectUrl: string;
  
  if (redirectUrl) {
    // Use the provided redirect URL
    fullRedirectUrl = redirectUrl;
  } else {
    // Try to use window.location.origin if available (browser environment)
    try {
      fullRedirectUrl = `${window.location.origin}/auth/callback`;
    } catch (error) {
      // Fallback for non-browser environments (like tests)
      fullRedirectUrl = '/auth/callback';
    }
  }
  
  return supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: fullRedirectUrl,
    },
  });
}

/**
 * Sign out the current user
 * @returns Promise with the result of the sign out operation
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = createClient();
  return supabase.auth.signOut();
}

/**
 * Get the current session
 * @returns Promise with the current session data
 */
export async function getSession() {
  const supabase = createClient();
  return supabase.auth.getSession();
}

/**
 * Get the current user
 * @returns Promise with the current user data or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

/**
 * Send a password reset email to the user
 * @param email User's email address
 * @param redirectUrl Optional URL to redirect to after password reset
 * @returns Promise with the result of the password reset request
 */
export async function resetPassword(email: string, redirectUrl?: string) {
  const supabase = createClient();
  
  // Determine the redirect URL
  let fullRedirectUrl: string;
  
  if (redirectUrl) {
    // Use the provided redirect URL
    fullRedirectUrl = redirectUrl;
  } else {
    // Try to use window.location.origin if available (browser environment)
    try {
      fullRedirectUrl = `${window.location.origin}/auth/reset-password/confirm`;
    } catch (error) {
      // Fallback for non-browser environments (like tests)
      fullRedirectUrl = '/auth/reset-password/confirm';
    }
  }
  
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: fullRedirectUrl,
  });
}

/**
 * Update the user's password
 * @param password New password
 * @returns Promise with the result of the password update operation
 */
export async function updatePassword(password: string) {
  const supabase = createClient();
  return supabase.auth.updateUser({ password });
}
