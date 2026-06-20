# 🚀 Quick Setup Checklist

## 1️⃣ Backend Setup

### Install Dependencies
```bash
cd backend
npm install
```
- ⬜ Run above command

### Database Setup
```bash
# Create PostgreSQL database
createdb nullfi

# Update backend/.env with:
DATABASE_URL="postgresql://user:password@localhost:5432/nullfi"

# Run migrations
npx prisma migrate dev
```
- ⬜ Create database
- ⬜ Update .env
- ⬜ Run migrations
- ⬜ Verify Prisma generated

### Test Backend
```bash
# Start development server
npm run dev
```
- ⬜ Server runs on http://localhost:3000
- ⬜ Test GET /health endpoint

---

## 2️⃣ Smart Contracts Setup

### Install Sui CLI
```bash
curl -sSL https://sui-releases.s3-accelerate.amazonaws.com/latest/install.sh | bash

# Verify
sui --version
```
- ⬜ Sui CLI installed

### Configure Testnet
```bash
sui client switch --env testnet
```
- ⬜ Switched to testnet

### Get Testnet SUI
- Go to Discord: https://discord.com/invite/sui
- Use #testnet-faucet channel
- Type: `$request <your-wallet-address>`
- ⬜ Received testnet SUI

### Build Contracts
```bash
cd contracts/nullfi
sui move build
```
- ⬜ Contracts built successfully

### Deploy to Testnet
```bash
sui client publish --gas-budget 50000000
```
- ⬜ Contracts deployed
- ⬜ Saved Package ID
- ⬜ Saved Object IDs

### Update Backend .env
```
SUI_ESCROW_PACKAGE_ID=0x...
SUI_TREASURY_OBJECT_ID=0x...
SUI_DEPLOYER_ADDRESS=0x...
```
- ⬜ Contract IDs added to .env

---

## 3️⃣ Integration & Testing

### Test Auth Endpoint
```bash
# Get message
curl http://localhost:3000/api/auth/message

# Verify signature (from Sui wallet)
curl -X POST http://localhost:3000/api/auth/verify-signature \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x...",
    "message": "...",
    "signature": "...",
    "publicKey": "..."
  }'
```
- ⬜ Auth endpoint works
- ⬜ JWT token generated

### Test Health Endpoints
```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/auth/message
```
- ⬜ Both respond OK

### Test Frontend Connection
- Open http://localhost:5173
- ⬜ Frontend loads
- ⬜ Navigation works
- ⬜ Ready for API integration

---

## 4️⃣ Next Phase (Coming Soon)

- [ ] Build Escrow routes
- [ ] Build Credit scoring service
- [ ] Build Borrow routes
- [ ] Connect frontend to backend API
- [ ] End-to-end testing
- [ ] Deploy to mainnet

---

## 📊 Progress Tracker

```
Setup Status:
├─ Frontend:       ✅ COMPLETE (100%)
├─ Backend API:    🔄 IN PROGRESS (30%)
├─ Smart Contracts: 🔄 IN PROGRESS (60%)
└─ Integration:    ⬜ PENDING (0%)
```

## 🆘 Troubleshooting

### npm install fails
- Make sure Node.js 20+ is installed
- Delete node_modules and package-lock.json
- Run npm install again

### Database connection error
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env
- Try: `psql -U user -d nullfi`

### Sui CLI not found
- Add to PATH or use full path
- Restart terminal after installation

### Contracts won't build
- Check Move.toml syntax
- Make sure Sui CLI is updated: `sui client switch --env testnet`

## 💾 File Locations

| What | Where |
|------|-------|
| Backend code | `backend/src/` |
| Database schema | `backend/prisma/schema.prisma` |
| Smart contracts | `contracts/nullfi/sources/` |
| Frontend | `src/` |
| Environment vars | `backend/.env` |

---

**Start with Step 1️⃣ and work through the checklist!**

Ready? Let's cook! 🔥
