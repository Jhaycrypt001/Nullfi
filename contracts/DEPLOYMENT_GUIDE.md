# Nullfi Smart Contracts - Deployment Guide

## Prerequisites

1. Install Sui CLI
```bash
curl -sSL https://sui-releases.s3-accelerate.amazonaws.com/latest/install.sh | bash
```

2. Configure for testnet
```bash
sui client switch --env testnet
```

3. Get testnet SUI
- Join Discord: https://discord.com/invite/sui
- Use #testnet-faucet channel
- Command: `$request <your-address>`

## Building Contracts

```bash
cd nullfi

# Build the package
sui move build

# You should see:
# Compiling Packages...
# Building for target ...
# Successfully built nullfi package
```

## Deploying to Testnet

```bash
# Publish the package
sui client publish --gas-budget 50000000

# Save the output:
# - Transaction Digest
# - Package ID
# - Object IDs (Escrow, Treasury, CreditScore)
```

## After Deployment

1. Create `testnet-deployment.json`:
```json
{
  "network": "testnet",
  "packageId": "0x...",
  "treasury": "0x...",
  "transactionDigest": "0x...",
  "deployerAddress": "0x..."
}
```

2. Update backend `.env`:
```
SUI_ESCROW_PACKAGE_ID=0x...
SUI_TREASURY_OBJECT_ID=0x...
SUI_DEPLOYER_ADDRESS=0x...
```

## Verifying Deployment

```bash
# Check object
sui client object <OBJECT_ID>

# Check transaction
sui client tx <TRANSACTION_DIGEST>

# View in explorer
https://suiscan.xyz/testnet/object/<OBJECT_ID>
```

## Contract Functions

### Escrow Functions
- `create_escrow()` - Create new escrow
- `release_milestone()` - Release payment
- `dispute_escrow()` - Open dispute

### View Functions
- `get_escrow_info()` - Get escrow details
- `get_escrow_balance()` - Get remaining balance

## Troubleshooting

**Error: insufficient gas**
- Increase `--gas-budget` value

**Error: module not found**
- Check Move.toml dependencies
- Run `sui move build` again

**Transaction failed**
- Check insufficient balance
- Check contract logic errors
