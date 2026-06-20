# Nullfi Backend API

Trust-Minimized Finance on Sui Blockchain

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create PostgreSQL database
createdb nullfi

# Update .env with DATABASE_URL
DATABASE_URL="postgresql://user:password@localhost:5432/nullfi"

# Run migrations
npx prisma migrate dev
```

### 3. Configure Environment
```bash
# Copy example
cp .env.example .env

# Fill in your values
# - DATABASE_URL
# - JWT_SECRET
# - SUI_NETWORK
# - SUI_RPC_URL
# - Contract IDs (after deployment)
```

### 4. Start Development Server
```bash
npm run dev
```

Server will run on http://localhost:3000

## API Endpoints

### Authentication
- `GET /api/auth/message` - Get message to sign
- `POST /api/auth/verify-signature` - Verify wallet and get JWT
- `GET /api/auth/verify-token` - Verify JWT token

### Health Check
- `GET /health` - Server status

## Project Structure

```
src/
├── app.ts              # Express setup
├── routes/             # API routes
│   └── auth.ts
├── services/           # Business logic
│   ├── authService.ts
│   └── suiService.ts
├── middleware/         # Custom middleware
├── models/             # Database models
└── types/              # TypeScript types

prisma/
└── schema.prisma       # Database schema
```

## Development Notes

- TypeScript enabled
- Prisma ORM for database
- JWT for authentication
- Sui.js for blockchain integration
- Express.js REST API

## Next Steps

1. Build escrow routes
2. Build credit scoring service
3. Build borrow routes
4. Deploy to testnet
