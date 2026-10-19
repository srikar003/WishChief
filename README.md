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

## Running on an Android phone

Expo Go may not match SDK 58, so use a development build:

1. `npx eas-cli build --platform android --profile development`, then install the APK from the build page.
2. Set `EXPO_PUBLIC_API_URL` in `.env` to the deployed API origin.
3. `npx expo start --dev-client --clear`, then open the WishChief app and pick your server.

Phone and PC must be on the same Wi-Fi. If the app just spins, Expo may be advertising a virtual adapter (WSL, VPN) that the phone can't reach. Pin the Wi-Fi address instead (PowerShell):

```powershell
$env:REACT_NATIVE_PACKAGER_HOSTNAME = "<your Wi-Fi IPv4 from ipconfig>"
npx expo start --dev-client --clear
```

`npx expo start --tunnel` is the fallback.

## Scripts

- `npm test` unit tests for the savings math (`src/lib/calc.ts`)
- `npm run typecheck`
- `npm run db:generate` / `npm run db:push`
