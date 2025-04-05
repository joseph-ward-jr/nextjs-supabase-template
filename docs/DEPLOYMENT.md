# AI Blog and Content Generation SaaS Platform - Deployment Guide

This guide will help you deploy the AI Blog and Content Generation SaaS Platform to a production environment.

## Prerequisites

Before deploying, you'll need:

1. A Supabase account and project
2. A Redis instance (e.g., Redis Cloud, Upstash, or self-hosted)
3. An OpenAI API key for ChatGPT-4o access
4. A domain name for your platform and user subdomains

## Environment Variables

Create a `.env.local` file with the following variables:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Redis
REDIS_URL=your-redis-url

# OpenAI (for ChatGPT-4o)
OPENAI_API_KEY=your-openai-api-key

# Base domain for user subdomains
NEXT_PUBLIC_BASE_DOMAIN=yourdomain.com
```

## Database Setup

1. Run the SQL migration file in your Supabase project:
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `migrations/0001_initial.sql`
   - Run the query to create all necessary tables and functions

## Google Authentication Setup

1. Create a Google OAuth client in the Google Cloud Console
2. Configure the redirect URI as `https://yourdomain.com/auth/callback`
3. Add Google as an auth provider in your Supabase project settings
4. Add your Google client ID and secret

## Redis Workers Setup

The platform uses Redis for queue management. You'll need to run the worker processes:

```bash
# Start the blog generation worker
node scripts/blog-generation-worker.js

# Start the image generation worker
node scripts/image-generation-worker.js
```

## Deployment

### Option 1: Vercel (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Import the project in Vercel
3. Configure the environment variables
4. Deploy

### Option 2: Self-hosted

1. Build the Next.js application:
   ```bash
   pnpm build
   ```

2. Start the production server:
   ```bash
   pnpm start
   ```

## Subdomain Configuration

For subdomain support, you'll need to configure wildcard DNS:

1. Add a wildcard DNS record: `*.yourdomain.com` pointing to your server
2. Configure your web server or hosting provider to handle wildcard subdomains

## Testing

After deployment, test the following:

1. User registration and login
2. Persona creation
3. Blog generation
4. Content editing
5. Publishing
6. Subdomain access

## Maintenance

Regularly check:

1. Redis queue status
2. Supabase database backups
3. OpenAI API usage and limits

## Support

If you encounter any issues, refer to:

1. Next.js documentation: https://nextjs.org/docs
2. Supabase documentation: https://supabase.io/docs
3. Redis documentation: https://redis.io/documentation
4. OpenAI API documentation: https://platform.openai.com/docs/api-reference
