# ATS Resume Analyzer

An intelligent web application that analyzes resumes for compatibility with Applicant Tracking Systems (ATS). Upload your CV and get instant feedback on how well it will perform in automated screening systems.

🚀 **Live Demo**: [https://ats-scan.patrykbarc.com/](https://ats-scan.patrykbarc.com/)

## Architecture

```mermaid
graph TD
  subgraph Client
    Browser
  end

  subgraph Vercel
    Web["Web (React + TanStack Router)"]
  end

  subgraph Render
    API["API"]
  end

  subgraph External
    OpenAI["OpenAI (gpt-4.1-nano / o3)"]
    Stripe
    Resend["Resend (email)"]
    Sentry["Sentry (errors)"]
  end

  subgraph Data
    DB[(PostgreSQL / Prisma)]
  end

  subgraph "Monorepo Packages"
    Schemas["@monorepo/schemas"]
    Types["@monorepo/types"]
    Database["@monorepo/database (Prisma client)"]
  end

  Browser --> Web
  Web -->|"REST (axios + httpOnly cookie)"| API
  API --> DB
  API --> OpenAI
  API --> Stripe
  API --> Resend
  API --> Sentry
  Web --> Sentry
  Schemas -.->|"shared validation"| Web
  Schemas -.->|"shared validation"| API
  Database -.-> API
```

## Features

- 📄 PDF resume parsing and analysis
- 🤖 AI-powered evaluation using OpenAI
- 📊 Detailed ATS compatibility scoring
- 💡 Actionable recommendations for improvement
- 🔐 User authentication (JWT + Passport.js)
- 📧 Email verification with Resend
- ⭐ Premium subscription system
- 🛡️ Rate limiting and security (Helmet, CORS)
- 🔍 Error tracking with Sentry
- 🧪 Unit + E2E tests (Vitest, Playwright)

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- TanStack Router & Query
- Zustand (state management)
- Shadcn UI
- Axios

### Backend

- Node.js
- Express
- TypeScript
- OpenAI API
- Passport.js
- Prisma ORM
- PostgreSQL
- Resend
- Multer
- Sentry

### Monorepo

- pnpm workspaces
- Shared packages for types, schemas, database, constants, and Sentry logging

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v24 or higher)
- **pnpm** (v10 or higher)
- **PostgreSQL** database
- **OpenAI API Key** - Get one from [OpenAI Platform](https://platform.openai.com/)
- **Resend API Key** (optional) - For email verification

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ats-resume-analyzer
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

#### API Configuration

Create a `.env` file in `apps/api/` directory:

```bash
cd apps/api
cp .env.template .env
```

Edit `apps/api/.env` and configure the following variables:

```env
NODE_ENV=development
PORT=8080

# OpenAI API Key (required)
OPENAI_API_KEY=your_openai_api_key_here

# Frontend URL for CORS (required for cookies/auth)
FRONTEND_URL=http://localhost:5173

# JWT Secrets (required) - generate with: pnpm --filter @monorepo/api gen-key
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

# Database (required)
DATABASE_URL=your_postgresql_connection_string
DIRECT_URL=your_postgresql_direct_connection_string

# Email (optional - for email verification)
RESEND_API_KEY=your_resend_api_key_here
EMAIL_SENDER=sender@example.com

# Stripe (optional - required for premium)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Stripe price (required for premium subscription)
STRIPE_PRICE_ID=your_stripe_price_id

# Cron (optional - for protected cron routes)
CRON_SECRET_KEY=your_random_cron_key

# Sentry (optional - for error tracking)
SENTRY_DSN=your_sentry_dsn_here
```

#### Web Configuration

Create a `.env` file in `apps/web/` directory:

```bash
cd apps/web
cp .env.template .env
```

Edit `apps/web/.env` and configure the following variables:

```env
# API URL (required)
VITE_API_URL=http://localhost:8080

# After editing env files, regenerate typed envs
# (validates presence and makes types available in code)
# From repo root:
# pnpm gen-envs
```

### 4. Running the Application

#### Development Mode

Run both frontend and backend simultaneously from root directory:

```bash
pnpm dev
```

Or run them separately:

```bash
# Terminal 1 - Run API server
pnpm dev:api

# Terminal 2 - Run web application
pnpm dev:web
```

The application will be available at:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080

Optional quick setup (build packages and generate Prisma client):

```bash
pnpm dev:setup
```

### 5. Database Setup

Run database migrations:

```bash
pnpm db:migrate
```

Generate Prisma client:

```bash
pnpm db:generate
```

#### Production Build

```bash
pnpm build
```

## Architecture & Technology Decisions

Key decisions made during development and the reasoning behind them:

### pnpm Monorepo with Shared Packages

A single pnpm workspace hosts both apps (`api`, `web`) and four shared packages (`database`, `types`, `schemas`, `constants`). This lets the Zod schemas that validate API request bodies be reused directly in the React forms — a single source of truth that eliminates drift between frontend validation and backend enforcement. The `pnpm catalogs` feature pins shared dependency versions (Zod, Stripe, TypeScript, etc.) across all packages without duplicating version strings.

### TanStack Router over React Router

TanStack Router provides file-based routing with full TypeScript inference for route params and search params. This avoids runtime `useParams()` / `useSearchParams()` casts and makes navigation type-safe end-to-end. The generated route tree is committed, so route changes are caught at compile time rather than at runtime.

### Tiered AI Models (gpt-4.1-nano / o3)

Free and signed-in analyses use `gpt-4.1-nano` (fast, low-cost). Premium analyses use `o3` (reasoning model, higher accuracy). The tier is determined server-side after verifying the subscription, so the model choice cannot be spoofed by the client.

### OpenAI Responses API

The backend uses the OpenAI **Responses API** (`openAiClient.responses.create`) rather than the legacy Chat Completions API. The Responses API returns a stable `id` alongside the output text, which is stored and used as the analysis record's primary key — enabling idempotent webhook re-delivery without duplicating records.

### Vitest for Testing

Vitest is ESM-native and shares configuration with the existing Vite/tsup build toolchain, eliminating the CJS/ESM transform issues that arise when using Jest with this stack. A single test runner covers both the Node.js API (`environment: 'node'`) and the React frontend (`environment: 'jsdom'`).

### Express 5

Express 5 is used for the API server. Compared to Express 4, async route handlers propagate thrown errors to the error middleware automatically — no need for `try/catch` wrappers or `next(err)` calls in every handler.

### Sentry for Error Tracking

Sentry is used instead of plain `console.error` or Pino for production error tracking. Unlike a file logger, Sentry captures full stack traces, request context, and user metadata, then surfaces them in a searchable dashboard — making it practical to detect and triage production errors without digging through log files. The integration lives in the `sentry-logger` shared package so both the API and any future service share a single, consistently-configured client.

### In-Memory Access Token Storage

The JWT access token is stored in a module-level JavaScript variable (`tokenStorage.ts`) rather than `localStorage`. This eliminates XSS exposure: scripts injected on any page of the domain cannot read the token. Sessions survive tab navigation because the token lives in the JS heap. Page refresh re-hydrates the token silently via the `httpOnly` refresh token cookie (`POST /auth/refresh`), which is inaccessible to JavaScript.

---

## Project Structure

```
ats-resume-analyzer/
├── apps/
│   ├── api/                 # Backend Express server
│   │   ├── src/
│   │   │   ├── config/      # Configuration (CORS, Passport, Pino, etc.)
│   │   │   ├── controllers/ # Request handlers
│   │   │   ├── middleware/  # Express middleware (auth, rate limit, validation)
│   │   │   ├── prompt/      # AI prompts (standard & pro)
│   │   │   ├── routes/      # API routes
│   │   │   ├── services/    # Business logic (email service)
│   │   │   └── templates/   # Email templates
│   │   └── package.json
│   └── web/                 # Frontend React application
│       ├── src/
│       │   ├── api/         # API client & React Query
│       │   ├── components/  # React components (UI, views, icons)
│       │   ├── hooks/       # Custom React hooks
│       │   ├── lib/         # Utilities
│       │   ├── routes/      # TanStack Router routes
│       │   ├── services/    # API services
│       │   └── stores/      # Zustand stores
│       └── package.json
├── packages/
│   ├── database/           # Prisma ORM & PostgreSQL
│   │   └── prisma/         # Schema & migrations
│   ├── constants/          # Shared constants
│   ├── schemas/            # Shared Zod schemas
│   ├── types/              # Shared TypeScript types
│   └── sentry-logger/      # Sentry error logging
├── scripts/                # Utility scripts
└── package.json
```

## Available Scripts

### Development

- `pnpm dev` - Run both frontend and backend in development mode
- `pnpm dev:api` - Run only the API server
- `pnpm dev:web` - Run only the web application

### Build

- `pnpm build` - Build all packages and applications
- `pnpm build:api` - Build only API and its dependencies
- `pnpm build:web` - Build only web and its dependencies

### Production

- `pnpm start:api` - Start API server in production mode

### Type Checking

- `pnpm type-check` - Run type checks across all packages
- `pnpm tsc` - Run TypeScript compiler check on all packages
- `pnpm tsc:web` - Run TypeScript compiler check on web only
- `pnpm tsc:api` - Run TypeScript compiler check on API only

### Database

- `pnpm db:migrate` - Run database migrations (development)
- `pnpm db:generate` - Generate Prisma client (development)
- `pnpm db:migrate:prod` - Run database migrations (production)
- `pnpm db:generate:prod` - Generate Prisma client (production)
- `pnpm db:studio` - Open Prisma Studio
- `pnpm db:reset` - Reset database

### Testing

- `pnpm test` — Run unit tests across all packages
- `pnpm test:e2e` — Run Playwright end-to-end tests

### Other

- `pnpm lint` - Run ESLint linter
- `pnpm prettier` - Format code with Prettier
- `pnpm gen-envs` - Generate TypeScript types from environment variables
- `pnpm clear` - Remove all build artifacts and dist folders

## API Endpoints

### Authentication

#### `POST /api/auth/register`

Register a new user account.

#### `POST /api/auth/login`

Login and receive JWT tokens.

#### `POST /api/auth/refresh`

Refresh access token.

#### `POST /api/auth/logout`

Logout and invalidate tokens.

#### `GET /api/auth/me`

Get current user information (protected).

#### `POST /api/auth/verify`

Verify email with confirmation token.

#### `POST /api/auth/verify/resend`

Resend email verification link.

#### `POST /api/auth/password/request-reset`

Request password reset link.

#### `POST /api/auth/password/reset`

Reset password with token.

### Resume Analysis

Endpoints are under `/api/cv`:

- `POST /api/cv/analyze/free` — public analysis, multipart with `file`
- `POST /api/cv/analyze/signed-in` — requires auth
- `POST /api/cv/analyze/premium` — requires premium subscription
- `GET /api/cv/analysis/:id` — fetch analysis by id
- `GET /api/cv/analysis-history/:id?cursor=<analyseId>&limit=10` — paginated history (cursor-based)

Request format (for analyze endpoints):

- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `file` (PDF file)
- Auth: varies by endpoint

### Health Check

#### `GET /health`

Check API health status.

### Checkout (Premium)

- `POST /api/checkout/create-checkout-session`
- `POST /api/checkout/checkout-session-webhook`
- `GET /api/checkout/verify-payment`
- `POST /api/checkout/cancel-subscription`
- `POST /api/checkout/restore-subscription`

## How It Works

1. **Upload**: User uploads a PDF resume through the web interface
2. **Parse**: The PDF is parsed to extract text content
3. **Analyze**: Content is sent to OpenAI API for ATS compatibility analysis
4. **Report**: User receives a detailed report with:
   - ATS compatibility score
   - Strengths and weaknesses
   - Actionable recommendations
   - Keyword optimization suggestions

## Development Story

### The Problem

Applicant Tracking Systems are opaque by design — candidates submit resumes and receive no feedback on why they were filtered out. This project was built to give candidates visibility into how ATS algorithms interpret their resume and actionable steps to improve their chances before applying.

### Core Decisions

**Tiered AI models** — Free and signed-in analyses use `gpt-4.1-nano` (fast, low-cost). Premium analyses use `o3` (OpenAI's reasoning model, higher accuracy). The tier is resolved server-side after verifying the Stripe subscription, so the model choice cannot be spoofed by the client.

**Monorepo shared schemas** — A single `@monorepo/schemas` package containing Zod schemas is imported by both the React frontend (form validation) and the Express backend (request validation middleware). This eliminates the class of bugs where frontend and backend silently diverge on what a valid request looks like.

**In-memory JWT storage** — The access token lives in a module-level JavaScript variable rather than `localStorage`. Any XSS payload can read `localStorage`, but it cannot reach a plain JS variable in another module. Page refreshes re-hydrate the token silently via the `httpOnly` refresh-token cookie (`POST /auth/refresh`), which is inaccessible to JavaScript entirely.

**OpenAI Responses API with idempotent storage** — The Responses API returns a stable `id` alongside the output text. This ID is stored as the analysis record's primary key, so webhook re-delivery or duplicate client requests cannot create duplicate records.

**Cursor-based pagination** — The analysis history endpoint uses cursor pagination (`analyseId` as the cursor, ordered by `createdAt desc`) rather than offset pagination. Offset pagination becomes slow at large offsets and returns inconsistent results when new items are inserted between pages. The cursor approach stays O(log n) and stable regardless of concurrent writes.

**Services layer** — Business logic (DB queries, Stripe calls, OpenAI lookups) lives in `services/`, while controllers only parse requests and send responses. This separation makes the business logic unit-testable without spinning up Express.

### Challenges

**Stripe webhook idempotency** — Stripe can deliver the same webhook event more than once. The `handleCheckoutSessionCompleted` handler is safe to re-run: it checks whether the subscription is already active before writing to the database, preventing duplicate premium grants on re-delivery.

**XSS-safe token storage** — Storing the JWT in a JS module variable (rather than `localStorage` or a non-`httpOnly` cookie) required building a silent refresh mechanism. On every page load, the React app calls `POST /auth/refresh` using the `httpOnly` cookie; if the cookie is valid the server returns a fresh access token and the user session is restored seamlessly.

**ESM/CJS in the monorepo** — The shared packages are built to both ESM and CJS targets via `tsup`. Without this, the Node.js API (CJS at runtime) and the Vite-built frontend (ESM) would fail to resolve the same package. `pnpm catalogs` pins the exact version of each shared dependency across all workspaces without duplicating version strings.

### What Would Change at Scale

- **Job queue** — AI analysis is handled inline in the HTTP request lifecycle. At scale this would move to a queue (e.g., BullMQ backed by Redis) so the response returns immediately and the client polls or receives a webhook when the analysis is ready.
- **Redis for rate limiting** — The current in-memory rate limiter is per-instance and resets on deploy. Redis-backed limiting would be shared across multiple API instances.
- **Read replicas** — The analysis history query runs against the primary database. Under high read volume, a read replica would offload these queries and keep write latency predictable.
- **Persistent file storage** — Uploaded PDFs are currently parsed in memory and discarded. Persisting them to object storage (e.g., S3) would enable re-analysis without re-upload and support future features like diff comparison between resume versions.

---

## Troubleshooting

### Common Issues

**Port already in use:**

```bash
# Change PORT in apps/api/.env
PORT=3000
```

**CORS errors:**

```bash
# Ensure FRONTEND_URL in apps/api/.env matches your frontend URL
FRONTEND_URL=http://localhost:5173
```

**OpenAI API errors:**

- Verify your API key is valid
- Check your OpenAI account has sufficient credits
- Ensure API key has proper permissions

**Database connection errors:**

- Verify PostgreSQL is running
- Check DATABASE_URL and DIRECT_URL are correct
- Run `pnpm db:migrate` to apply migrations

**Prisma client errors:**

- Run `pnpm db:generate` to regenerate Prisma client
- Ensure database schema is up to date

**Zod schema from @monorepo/schemas isn't validating!**

- Remember to rebuild the packages after each change using the `pnpm run build` command from the root directory.

**getEnvs function doesn't return my newly added env variable!**

- Remember to regenerate the types after each change using the `pnpm gen-envs` command from the root directory.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Support

For issues and questions, please open an issue in the repository.

---

Built with ❤️ using React, Express, Prisma, and OpenAI
