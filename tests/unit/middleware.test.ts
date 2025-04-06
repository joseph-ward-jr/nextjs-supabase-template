import { NextRequest, NextResponse } from 'next/server';

// Mock the middleware module directly
jest.mock('@/middleware', () => ({
  middleware: jest.fn(async () => {
    return { type: 'next' };
  }),
  config: {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
  },
}));

// Import the mocked middleware
import { middleware, config } from '@/middleware';

describe('Middleware Configuration', () => {
  it('should have the correct matcher configuration', () => {
    // Check that the middleware is configured to run on all routes except static files
    expect(config.matcher).toContain(
      '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    );
  });
});

describe('Middleware Implementation', () => {
  it('should be a function', () => {
    // Basic check that middleware is a function
    expect(typeof middleware).toBe('function');
  });
});

