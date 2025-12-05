# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/43cd49c6-c090-4cdf-a7a1-c6661e1a80aa

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/43cd49c6-c090-4cdf-a7a1-c6661e1a80aa) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the Next.js development server.
npm run dev

The app will be available at http://localhost:3000

**Note**: For the original Vite setup, use `npm run dev:vite` instead.
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Next.js (Pages Router) - migrated from Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

**Note**: This project was migrated from Vite to Next.js on the `migrate/nextjs-pages` branch. The original Vite files are preserved in the `src/` directory as backup.

## Demo Mode

This project includes a demo mode feature that allows you to use sample data for development and testing.

### Enabling Demo Mode

1. Copy `.env.example` to `.env.local`:
   ```sh
   cp .env.example .env.local
   ```

2. Set `NEXT_PUBLIC_DEMO_MODE=true` in `.env.local`:
   ```
   NEXT_PUBLIC_DEMO_MODE=true
   ```

3. Restart your development server.

### Demo Data Location

- **Demo TypeScript/JavaScript modules**: `src/demo/*`
  - `ndviDemoResponse.ts` - NDVI analysis demo data
  - `demoClaims.ts` - Sample claim data
  - `demoCredits.ts` - Sample credit data
  - `demoMarketplace.ts` - Marketplace listing data
  - `demoPendingClaims.ts` - Pending verification claims

- **Demo assets**: `public/demo/*`
  - `before.jpg` - NDVI before image (800×600)
  - `after.jpg` - NDVI after image (800×600)
  - `placeholder-avatar.png` - Placeholder avatar image

### Disabling Demo Mode

Set `NEXT_PUBLIC_DEMO_MODE=false` in `.env.local` or remove the variable. The app will then use real API endpoints or show empty states.

**Note**: When demo mode is disabled, components will attempt to fetch data from API routes. Ensure your API endpoints are properly configured.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/43cd49c6-c090-4cdf-a7a1-c6661e1a80aa) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
