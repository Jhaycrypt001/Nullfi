# 🚀 NULLFI - QUICK START (5 MINUTES)

## Start Everything

### **1. Start Backend (Terminal 1)**
```bash
cd c:\Users\USER\nullfi
npm run dev

# You should see:
# Server running on http://localhost:3000
```

### **2. Start Frontend (Terminal 2)**
```bash
cd c:\Users\USER\nullfi
npm run dev

# You should see:
# ➜  Local:   http://localhost:5173
```

### **3. Open Browser**
```
http://localhost:5173
```

---

## Wallet Setup

### **Install Sui Wallet**
1. Go to Chrome Web Store
2. Search "Sui Wallet"
3. Click Install
4. Create testnet account

### **Get Test SUI**
1. Go to https://faucet.testnet.sui.io
2. Paste your Sui address (0x...)
3. Click "Request SUI Coins"
4. Wait for confirmation
5. Repeat 2-3 times (get 2-3 SUI total)

---

## Sign In

1. Click "Sign In" on landing page
2. Click "Sui Wallet"
3. Approve connection in wallet extension
4. You're logged in! ✅

---

## Test Real Transaction (Create Escrow)

### **Step 1: Navigate to Escrows tab**

### **Step 2: Click "+ Create Escrow"**

### **Step 3: Fill Form**
```
Freelancer Address: 0x[paste another test wallet address]
Job Title: Test Project
Category: Web Development
Amount: 100
Milestones: 1
```

### **Step 4: Click "Create Escrow"**
- Wallet extension pops up
- Click "Sign"
- Wait 30-60 seconds for confirmation

### **Step 5: Success! ✅**
You'll see:
```
✅ Escrow created on Sui blockchain
TX: 0x1234567890...
```

---

## Test Real Token Transfer (Release Milestone)

### **Step 1: Select Escrow from List**

### **Step 2: Click "Release Milestone"**
- Wallet pops up
- Click "Sign"
- Wait for confirmation

### **Step 3: Success! ✅**
Freelancer receives actual SUI tokens!

---

## View on Blockchain

### **Check Transaction**
1. Copy transaction digest (TX hash)
2. Go to https://explorer.sui.io
3. Select "Testnet" network
4. Paste transaction digest
5. See full transaction details

---

## Check Database

### **View Created Escrow**
```bash
# In database terminal
psql -U postgres -d nullfi

# Run:
SELECT * FROM "Escrow" LIMIT 1;
```

---

## Real Transaction Flow (What's Happening)

```
1️⃣ You click "Create Escrow"
   ↓
2️⃣ App calls: ContractExecutor.createEscrow()
   ↓
3️⃣ Backend builds Sui transaction (SuiContractService)
   ↓
4️⃣ Frontend gets unsigned transaction
   ↓
5️⃣ Wallet pops up - YOU SIGN IT
   ↓
6️⃣ Frontend executes on Sui blockchain
   ↓
7️⃣ Transaction confirmed in ~30-60 seconds
   ↓
8️⃣ Database updated
   ↓
9️⃣ You see success toast ✅
```

---

## Key Files (What's Production Ready)

✅ **Backend:**
- `src/services/suiContractService.ts` - Builds Sui transactions
- `src/routes/escrow.ts` - Escrow API endpoints
- `src/routes/borrow.ts` - Borrow API endpoints
- `backend/.env` - Smart contract addresses

✅ **Frontend:**
- `src/services/walletManager.ts` - Signs & executes transactions
- `src/services/contractExecutor.ts` - Orchestrates flow
- `src/hooks/useWallet.ts` - Wallet state management
- `src/App.tsx` - Dashboard with real Sui integration

---

## Testing Checklist

- [ ] Backend running
- [ ] Frontend running
- [ ] Wallet installed & funded (2+ SUI)
- [ ] Can sign in
- [ ] Can create escrow
- [ ] Can release milestone
- [ ] Transaction visible on explorer
- [ ] Database updated

---

## Troubleshooting

**"Sui Wallet extension not found"**
→ Install from Chrome Web Store

**"Transaction timeout"**
→ Wait longer or check Sui status page

**"Insufficient balance"**
→ Get more SUI from faucet

**"Invalid address"**
→ Use 0x... format, 64 hex chars

---

## YOU'RE GOOD TO GO! 🚀

This is **REAL DeFi** - actual smart contracts, real SUI blockchain, real token transfers.

Everything is production-ready on Sui testnet!
