# ATS Resume Analyzer

An intelligent web application that analyzes resumes for compatibility with Applicant Tracking Systems (ATS). Upload your CV and get instant feedback on how well it will perform in automated screening systems.

🚀 **Live Demo**: [https://ats-scan.patrykbarc.com/](https://ats-scan.patrykbarc.com/)

## Features

- 📄 PDF resume parsing and analysis
- 🤖 AI-powered evaluation using OpenAI
- 📊 Detailed ATS compatibility scoring
- 💡 Actionable recommendations for improvement
- 🔐 User authentication (JWT + Passport.js)
- 📧 Email verification with Resend
- ⭐ Premium subscription system
- 🛡️ Rate limiting and security (Helmet, CORS)

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- TanStack Router & React Query
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

### Monorepo

- pnpm workspaces
- Shared packages for types, schemas, database, and PDF parsing

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20 or higher)
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

# Cron (optional - for protected cron routes)
CRON_SECRET_KEY=your_random_cron_key
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
│   └── types/              # Shared TypeScript types
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
- `GET /api/cv/analysis-history/:id?page=1&limit=10` — paginated history (offset-based)

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
