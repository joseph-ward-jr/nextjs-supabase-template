import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in middleware')
    return response
  }

  // Create a Supabase client specifically for the middleware
  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          // If the cookie is updated, update the request and response
          // Next.js cookies API expects different parameters than Supabase
          // Handle the type mismatch
          request.cookies.set({
            name,
            value,
            ...(options as any),
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...(options as any),
          })
        },
        remove(name: string, options) {
          // If the cookie is removed, update the request and response
          request.cookies.delete({
            name,
            ...(options as any),
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.delete({
            name,
            ...(options as any),
          })
        },
      },
    }
  )

  // Refresh the session if it exists
  const { data } = await supabase.auth.getSession()

  // Optional: Check authentication for protected routes
  const pathname = request.nextUrl.pathname
  
  // Example of protected routes logic (uncomment and customize as needed)
  /*
  // Define which routes require authentication
  const protectedRoutes = ['/dashboard', '/profile', '/settings']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Redirect to login if accessing a protected route without a session
  if (isProtectedRoute && !data.session) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }
  */

  return response
}

// Specify which routes the middleware should run on
export const config = {
  // Apply to all routes except static files, api routes, and other exceptions
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}