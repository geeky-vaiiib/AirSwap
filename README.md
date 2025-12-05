# AirSwap Growth - Oxygen Credits Platform

## Project Overview

AirSwap is a platform that verifies vegetation growth using satellite NDVI data and issues blockchain-backed Oxygen Credits to landowners worldwide.

**URL**: https://lovable.dev/projects/43cd49c6-c090-4cdf-a7a1-c6661e1a80aa

## 🚀 Quick Start

### Prerequisites

- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Local Development

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd airswap-growth

# Step 3: Install dependencies
npm install

# Step 4: Start the Next.js development server
npm run dev
```

The app will be available at **http://localhost:3000**

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🛠 Tech Stack

**Next.js is the canonical runtime** for this project:

- **Next.js 14.2** (Pages Router) - React framework
- **TypeScript 5.8** - Type safety
- **React 18.3** - UI library
- **Tailwind CSS 3.4** - Styling
- **shadcn/ui** - Component library
- **React Query** - Data fetching
- **Leaflet** - Map visualization

## 📁 Project Structure

```
airswap-growth/
├── pages/              # Next.js pages (canonical)
│   ├── _app.tsx       # App wrapper
│   ├── index.tsx      # Landing page
│   ├── login.tsx
│   ├── signup.tsx
│   ├── map.tsx
│   ├── api/           # API routes
│   └── dashboard/     # Dashboard pages
├── components/        # React components (canonical)
├── styles/           # Global styles
├── public/           # Static assets
├── src/
│   ├── demo/         # Demo data modules
│   ├── hooks/        # React hooks
│   └── lib/          # Utility functions
├── .backup/          # Archived files
│   └── vite-artifacts/  # Legacy Vite files
└── next.config.js    # Next.js configuration
```

## ⚠️ Stack Migration Note

This project was migrated from Vite to Next.js on **2025-12-05** (branch: `chore/ensure-nextjs-stack`).

**Vite artifacts have been archived** to `.backup/vite-artifacts/` including:
- `vite.config.ts`
- `index.html`
- `src/main.tsx`, `src/App.tsx`
- Duplicate `src/components/`, `src/pages/`

**Next.js is now the only supported runtime.** The `npm run dev:vite` scripts have been removed.

See `migration-detect.json` and `SMOKE_TEST_RESULTS.md` for migration details.

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
