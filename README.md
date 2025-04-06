# Next.js + Supabase + Tailwind + shadcn/ui Template

A production-ready template for building full-stack applications using Next.js, Supabase, Tailwind CSS, and shadcn/ui. Optimized for deployment on Vercel.

## Features

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/) - Copy-paste components built with Radix UI and Tailwind.
*   **Database:** [Supabase](https://supabase.com/) Postgres
*   **Auth:** [Supabase Auth](https://supabase.com/auth)
*   **Linting:** ESLint
*   **Formatting:** Prettier
*   **Testing:** [Playwright](https://playwright.dev/) (or Jest - *adjust based on choice*) for End-to-End testing.
*   **Deployment:** Ready for [Vercel](https://vercel.com/)

## Getting Started

1.  **Use this template:** Click the "Use this template" button on GitHub to create your new repository.
2.  **Clone your repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```
3.  **Install dependencies:**
    ```bash
    npm install --legacy-peer-deps
    ```
    > **Note:** Due to using React 19, you may encounter peer dependency conflicts with some libraries. Use the `--legacy-peer-deps` flag during `npm install` (or when adding individual packages like shadcn components) if prompted, as recommended by shadcn/ui documentation for React 19.
4.  **Set up Environment Variables:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env.local
        ```
    *   Create a Supabase project at [database.new](https://database.new).
    *   Navigate to Project Settings > API.
    *   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in your `.env.local` file with the values from your Supabase project.
    *   (Optional) If you need admin actions server-side, also add `SUPABASE_SERVICE_ROLE_KEY` (found under API > Project API keys). **Be careful not to expose this key client-side.**
5.  **Set up Supabase Database:**
    *   Connect to your Supabase database using your preferred SQL client or the Supabase SQL Editor.
    *   Run the SQL commands found in the `/supabase/migrations/0000_initial_schema.sql` file. This sets up the essential baseline schema (e.g., `profiles` table linked to `auth.users`) required for the application to function.
    *   *(Alternatively, if using Supabase CLI locally):* `npx supabase db push`

    > **Note on Database Changes:** This initial migration provides the starting point. For subsequent database schema changes during development, this project plans to utilize Supabase Management API tools (like the Model Context Protocol server) which automatically track schema changes, potentially reducing the need for manual `.sql` migration files for every alteration. However, traditional migration management with the Supabase CLI is also fully compatible.

6.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the result.

## Using shadcn/ui

This template comes pre-configured with `shadcn/ui`.

*   **Component Location:** UI components are located in `src/components/ui`.
*   **Adding New Components:** Use the `shadcn` CLI:
    ```bash
    npx shadcn@latest add [component-name]
    ```
    > Remember to use `--legacy-peer-deps` if npm prompts due to React 19 conflicts.
    Example: `npx shadcn@latest add card`
*   **Customization:** Modify components directly in `src/components/ui` by editing their Tailwind classes. Refer to the [shadcn/ui documentation](https://ui.shadcn.com/docs) for available components and usage.
*   **Utils:** Helper functions like `cn` (for conditional class names) are in `src/lib/utils.ts`.

## Testing

This project uses [Jest](https://jestjs.io/) for unit testing and [Playwright](https://playwright.dev/) for end-to-end testing.

*   **Run all tests (unit, E2E, and linting):**
    ```bash
    npm test
    ```

*   **Run only unit tests:**
    ```bash
    npm run test:unit
    ```

*   **Run only E2E tests:**
    ```bash
    npm run test:e2e
    ```

*   **Run E2E tests with UI:**
    ```bash
    npm run test:e2e:ui
    ```

*   **Test Locations:** 
    - Unit tests are in `/tests/unit`
    - E2E tests are in `/tests/e2e`

*   **Configuration:** 
    - Jest configuration is in `package.json`
    - Playwright configuration is in `playwright.config.ts`

*   **CI Integration:**
    - GitHub Actions workflow runs all tests on push and PR
    - Tests must pass before PRs can be merged to main

## Deployment

This application is optimized for deployment on [Vercel](https://vercel.com/).

1.  **Push your code:** Ensure your code is pushed to your GitHub repository.
2.  **Import Project on Vercel:** Go to your Vercel dashboard and import the project from GitHub.
3.  **Configure Environment Variables:** In the Vercel project settings, add the same environment variables you defined in `.env.local`:
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
    *   `SUPABASE_SERVICE_ROLE_KEY` (if used)
4.  **Deploy:** Vercel will automatically build and deploy your application.

## Project Structure

```
/
├── .github/            # GitHub Actions workflows (Planned)
│   └── workflows/
│       └── ci.yml      # CI workflow (Planned)
├── public/             # Static assets (favicon, etc.)
├── supabase/           # Supabase specific files (Planned)
│   └── migrations/     # Database migration files (Planned)
│       └── 0000_initial_schema.sql
├── src/                # Source code
│   ├── app/            # Next.js App Router (pages, layouts, route handlers)
│   │   └── globals.css # Global styles (updated by shadcn)
│   │   └── layout.tsx
│   │   └── page.tsx
│   ├── components/     # React components
│   │   └── ui/         # shadcn/ui components (e.g., button.tsx)
│   │   └── ...         # Other shared/feature components (Planned)
│   ├── lib/            # Shared utilities, hooks, etc.
│   │   ├── supabase/     # Supabase client setup utils (Planned)
│   │   └── utils.ts    # shadcn utils (cn function)
│   └── ...             # Other source files if needed
├── tests/              # Test files
│   └── e2e/            # Playwright E2E tests (Planned)
├── .env.example        # Example environment variables
├── .gitignore          # Files/folders ignored by Git
├── .prettierignore     # Files/folders ignored by Prettier
├── .prettierrc.json    # Prettier configuration
├── components.json     # shadcn/ui configuration
├── eslint.config.mjs   # ESLint configuration
├── next-env.d.ts       # Next.js TypeScript declarations
├── next.config.ts      # Next.js configuration
├── package.json        # Project dependencies and scripts
├── package-lock.json   # Dependency lock file
├── playwright.config.ts # Playwright configuration
├── postcss.config.mjs  # PostCSS configuration (for Tailwind)
├── README.md           # This file
├── tailwind.config.ts  # Tailwind CSS configuration (updated by shadcn)
└── tsconfig.json       # TypeScript configuration
```

*(Note: Adjust file extensions like .mjs/.js/.ts based on your actual config files)*