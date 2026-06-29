# SafeGuard — Setup Guide

## Quick Start (3 steps)

### 1. Install dependencies
```bash
pnpm install
```

### 2. Setup Database
```bash
# Make sure PostgreSQL is running, then:
cd lib/db
cp ../../.env.example .env   # Edit DATABASE_URL with your password
pnpm drizzle-kit push
cd ../..
```

### 3. Run everything (3 terminals)

**Terminal 1 — API Server:**
```bash
cd artifacts/api-server
echo "DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/safeguard_dev" > .env
pnpm dev
# Runs on http://localhost:3000
```

**Terminal 2 — Web Dashboard:**
```bash
cd artifacts/dashboard
pnpm dev
# Opens at http://localhost:5173
```

**Terminal 3 — Mobile App:**
```bash
cd artifacts/mobile
echo "EXPO_PUBLIC_DOMAIN=localhost:3000" > .env
pnpm expo start
# Press 'w' for browser, 'a' for Android, 'i' for iOS
```

## Notes
- `@workspace/api-client-react` is pre-built in `lib/api-client-react/`
- To regenerate from OpenAPI: `cd lib/api-spec && pnpm codegen`
- Windows users: Use PowerShell or Git Bash
