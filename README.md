# WishChief

Mobile savings tracker (Expo + Neon Postgres). Set a goal, log savings, watch the reels count down what's left, and keep a wishlist. Buying a wish adds its price back to the goal unless it's an asset (like gold).

## Setup

Requires Node 22.13 or newer (Expo SDK 58). Tested on Node 24 LTS (`.nvmrc`).

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL`: Neon pooled connection string (Neon dashboard > Connect).
   - `BETTER_AUTH_SECRET`: any random string of 32+ characters (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: optional until you want Google sign-in (see below).
3. Create the tables: `npm run db:push`
4. Start: `npm run web` (or `npx expo start` and open in Expo Go).

### Google sign-in

1. Google Cloud Console > APIs & Services > OAuth consent screen, then Credentials > Create OAuth client ID > Web application.
2. Authorized redirect URI: `<API origin>/api/auth/callback/google`
   (local web: `http://localhost:8081/api/auth/callback/google`).
3. Put the client ID and secret in `.env`.

Google rejects private-IP redirect URIs, so on a phone you need the API deployed to a public URL.
Set `EXPO_PUBLIC_API_URL` and `BETTER_AUTH_URL` to that origin.

## Scripts

- `npm test` unit tests for the savings math (`src/lib/calc.ts`)
- `npm run typecheck`
- `npm run db:generate` / `npm run db:push`
