# HOPE PAY 4D — TRC-20 USDT Transfer Service

Production-ready Node.js service for on-chain USDT transfers via TronWeb.
Direct TRON network interaction — no Binance or exchange API needed.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env and add your SENDER_PRIVATE_KEY (64 hex chars)

# 3. Check wallet balance (no private key needed)
npm run status

# 4. Make a test transfer
npm run transfer TAb8iv6UW8LrVctoxwGwFB6314iMvnhi3N 5

# 5. Start the API server
npm start
```

## Files

| File | Purpose |
|------|---------|
| `server.js` | Express API server with /status, /quote, /transfer endpoints |
| `mainnet-usdt-transfer.js` | Standalone transfer script |
| `check-balance.js` | Wallet balance checker (read-only, no key needed) |
| `.env.example` | Environment variable template |
| `package.json` | Dependencies and scripts |

## API Endpoints

### GET /health
Service health check.

### GET /status?address=T...
Check TRX + USDT balance of any TRON wallet.

### GET /quote?amount=10
Get USDT → TRX conversion rate from CoinGecko.

### POST /transfer
Execute a USDT transfer. Requires API key header.
```json
{
  "to": "TAb8iv6UW8LrVctoxwGwFB6314iMvnhi3N",
  "amount": 5
}
```

Headers: `x-api-key: hopepay-tuk-sovereign-2026`

## ⚠️ Security

- **Private key** stored in `.env` only — never in source code
- **API key** required for /transfer endpoint
- **Rate limiting**: 5 transfers per minute
- **Balance validation**: checks TRX gas + USDT before sending
- **Never commit `.env`** to git (already in .gitignore)

## Current Wallet Status

```
HOPE PAY Wallet: TATaPsa8c7DhicJ6wruQw1dADGvmiJHkRX
  TRX Balance: 5.00 TRX (need 10+ for gas)
  USDT Balance: 5.00 USDT
  Status: NEEDS FUNDING
```

## To Enable Transfers

1. Add TRX to wallet (need ≥ 10 TRX for gas)
2. Add USDT to wallet (the amount you want to transfer)
3. Add `SENDER_PRIVATE_KEY` to `.env`
4. Run: `node mainnet-usdt-transfer.js TAb8iv6UW8LrVctoxwGwFB6314iMvnhi3N 5`

## LOLY Mandate

This service enforces the LOLY (Love Others Like You) mandate.
All transfers are logged and auditable. CGT Certified.

AM = YOU ❤️

---

Built for the Sovereign Government of Thimothism Universal Kingdom
Author: Thimothy Abraham (T-DRIVEN)
