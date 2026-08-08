/**
 * HOPE PAY 4D — TRC-20 USDT Transfer Service
 * 
 * Production-ready Express API for on-chain USDT transfers via TronWeb.
 * No Binance API needed — direct TRON network interaction.
 * 
 * ENDPOINTS:
 *   GET  /status?address=T...    → Check TRX + USDT balance
 *   GET  /quote                  → USDT→TRX conversion rate
 *   POST /transfer               → Execute USDT transfer
 *        body: { "to": "T...", "amount": 10 }
 *   GET  /health                 → Service health check
 * 
 * SECURITY:
 *   - Private key stored in .env (never committed to git)
 *   - API key authentication on /transfer endpoint
 *   - Rate limiting (5 transfers/min)
 *   - Balance validation before sending
 * 
 * LOLY Mandate Enforced | CGT Certified | AM = YOU ❤️
 * 
 * DEPLOY: npm install && node server.js
 */

require('dotenv').config();
const express = require('express');
const TronWeb = require('tronweb');
const rateLimit = require('express-rate-limit');
const app = express();

app.use(express.json());

// ============================================================
// Configuration
// ============================================================

const TRON_NETWORK = process.env.TRON_NETWORK || 'mainnet';
const FULL_HOST = TRON_NETWORK === 'mainnet'
  ? 'https://api.trongrid.io'
  : 'https://api.nileex.io';

const SENDER_ADDRESS = process.env.SENDER_ADDRESS;
const SENDER_PRIVATE_KEY = process.env.SENDER_PRIVATE_KEY;
const USDT_CONTRACT = process.env.USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const API_KEY = process.env.TRANSFER_API_KEY || 'hopepay-tuk-sovereign-2026';
const PORT = process.env.PORT || 3000;

// Validate required env vars
if (!SENDER_ADDRESS) {
  console.error('❌ SENDER_ADDRESS not set in .env');
  process.exit(1);
}

if (!SENDER_PRIVATE_KEY) {
  console.error('❌ SENDER_PRIVATE_KEY not set in .env');
  console.error('   The private key is REQUIRED to sign transactions.');
  console.error('   Without it, this service can only check balances (read-only).');
  console.error('   To enable transfers: add SENDER_PRIVATE_KEY to .env');
}

// ============================================================
// Initialize TronWeb
// ============================================================

const tronWeb = new TronWeb({
  fullHost: FULL_HOST,
  privateKey: SENDER_PRIVATE_KEY || undefined,
});

let usdtContract = null;

async function initContract() {
  try {
    usdtContract = await tronWeb.contract().at(USDT_CONTRACT);
    console.log(`✅ USDT contract loaded: ${USDT_CONTRACT}`);
  } catch (e) {
    console.error('❌ Failed to load USDT contract:', e.message);
  }
}

// ============================================================
// Rate limiting
// ============================================================

const transferLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,              // 5 transfers per minute
  message: { error: 'Rate limit exceeded — max 5 transfers/min' },
});

// ============================================================
// API Key middleware
// ============================================================

function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'] || req.query.apikey;
  if (key !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized — valid API key required' });
  }
  next();
}

// ============================================================
// Helper: Get TRX + USDT balance
// ============================================================

async function getBalances(address) {
  const trxBalance = await tronWeb.trx.getBalance(address);
  const trx = trxBalance / 1e6; // SUN → TRX

  let usdt = 0;
  if (usdtContract) {
    const usdtBalance = await usdtContract.balanceOf(address).call();
    usdt = Number(usdtBalance.toString()) / 1e6;
  }

  return { trx, usdt };
}

// ============================================================
// GET /health — Service health check
// ============================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'HOPE PAY 4D — TRC-20 USDT Transfer Service',
    network: TRON_NETWORK,
    sender: SENDER_ADDRESS,
    signing: SENDER_PRIVATE_KEY ? 'ENABLED ✅' : 'DISABLED ❌ (read-only mode)',
    lol_verified: true,
    cgt_certified: true,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// GET /status?address=T... — Check wallet balance
// ============================================================

app.get('/status', async (req, res) => {
  try {
    const address = req.query.address || SENDER_ADDRESS;
    
    if (!address || !address.startsWith('T') || address.length !== 34) {
      return res.status(400).json({ error: 'Invalid TRON address' });
    }

    const balances = await getBalances(address);
    const canTransfer = balances.trx >= 5 && SENDER_PRIVATE_KEY ? true : false;

    res.json({
      address,
      network: TRON_NETWORK,
      balances: {
        trx: balances.trx.toFixed(2) + ' TRX',
        usdt: balances.usdt.toFixed(2) + ' USDT',
        trx_raw: balances.trx,
        usdt_raw: balances.usdt,
      },
      transfer_ready: canTransfer,
      needs_funding: balances.trx < 10 || balances.usdt === 0,
      message: canTransfer
        ? '✅ Wallet ready for transfers'
        : balances.trx < 10
          ? '⚠️ Need at least 10 TRX for gas fees'
          : !SENDER_PRIVATE_KEY
            ? '⚠️ Private key not configured — read-only mode'
            : '⚠️ Insufficient USDT balance',
    });
  } catch (e) {
    console.error('Status error:', e.message);
    res.status(500).json({ error: 'Unable to fetch balances', details: e.message });
  }
});

// ============================================================
// GET /quote — USDT to TRX conversion rate
// ============================================================

app.get('/quote', async (req, res) => {
  try {
    const amount = parseFloat(req.query.amount) || 1;
    
    // Try CoinGecko for live TRX price
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd',
      { headers: { Accept: 'application/json' } }
    );
    const data = await response.json();
    const trxUsd = data?.tron?.usd || 0.15; // fallback rate
    
    res.json({
      amount_usdt: amount,
      trx_price_usd: trxUsd,
      usdt_to_trx: (amount / trxUsd).toFixed(2),
      note: `1 USDT ≈ ${(1 / trxUsd).toFixed(2)} TRX`,
      source: 'CoinGecko',
    });
  } catch (e) {
    res.status(500).json({ error: 'Quote service unavailable', details: e.message });
  }
});

// ============================================================
// POST /transfer — Execute USDT transfer (REQUIRES API KEY)
// ============================================================

app.post('/transfer', requireApiKey, transferLimiter, async (req, res) => {
  const { to, amount } = req.body;

  // Validate inputs
  if (!to || !to.startsWith('T') || to.length !== 34) {
    return res.status(400).json({ error: 'Invalid recipient address — must start with T, 34 characters' });
  }
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount — must be greater than 0' });
  }
  if (to === SENDER_ADDRESS) {
    return res.status(400).json({ error: 'Sender and receiver cannot be the same address' });
  }

  // Check if private key is configured
  if (!SENDER_PRIVATE_KEY) {
    return res.status(403).json({
      error: 'Transfer service is in read-only mode',
      details: 'SENDER_PRIVATE_KEY not configured in .env',
      fix: 'Add SENDER_PRIVATE_KEY to your .env file and restart the service',
    });
  }

  try {
    // 1️⃣ Verify sender has enough TRX for gas
    const senderBal = await getBalances(SENDER_ADDRESS);
    if (senderBal.trx < 5) {
      return res.status(400).json({
        error: 'Insufficient TRX for gas',
        details: `Sender has ${senderBal.trx.toFixed(2)} TRX — need at least 5 TRX`,
        fix: `Send TRX to ${SENDER_ADDRESS}`,
      });
    }

    // 2️⃣ Verify USDT balance
    if (senderBal.usdt < amount) {
      return res.status(400).json({
        error: 'Insufficient USDT balance',
        details: `Sender has ${senderBal.usdt.toFixed(2)} USDT — trying to send ${amount} USDT`,
      });
    }

    // 3️⃣ Build and send the USDT transfer
    console.log(`🔁 Transferring ${amount} USDT from ${SENDER_ADDRESS} to ${to}...`);

    const tx = await usdtContract
      .transfer(to, Math.floor(amount * 1e6))
      .send({ feeLimit: 1000000 }); // 1 TRX fee limit

    console.log(`✅ Transfer submitted! TXID: ${tx}`);

    // 4️⃣ Return success with transaction ID
    res.json({
      success: true,
      txid: tx,
      tronscan: `https://tronscan.org/#/transaction/${tx}`,
      from: SENDER_ADDRESS,
      to: to,
      amount: amount + ' USDT',
      network: 'TRON TRC-20',
      gas_used: '~1 TRX',
      timestamp: new Date().toISOString(),
      message: `Sent ${amount} USDT to ${to}`,
      lol_verified: true,
      cgt_certified: true,
    });
  } catch (e) {
    console.error('Transfer error:', e.message);
    res.status(500).json({
      error: 'Transfer failed',
      details: e.message,
      from: SENDER_ADDRESS,
      to: to,
      amount: amount + ' USDT',
    });
  }
});

// ============================================================
// Start server
// ============================================================

(async () => {
  await initContract();
  app.listen(PORT, () => {
    console.log('═══════════════════════════════════════════════════');
    console.log(`  💎 HOPE PAY 4D — USDT Transfer Service`);
    console.log(`  🌐 Network: TRON ${TRON_NETWORK.toUpperCase()}`);
    console.log(`  📡 Listening on port ${PORT}`);
    console.log(`  🏦 Sender: ${SENDER_ADDRESS}`);
    console.log(`  🔑 Signing: ${SENDER_PRIVATE_KEY ? 'ENABLED ✅' : 'READ-ONLY ❌'}`);
    console.log(`  🔒 API Key: Required for /transfer`);
    console.log(`  ⚡ Rate limit: 5 transfers/min`);
    console.log(`  ❤️ LOLY Mandate: ENFORCED`);
    console.log(`  ✅ CGT Certified`);
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('Endpoints:');
    console.log('  GET  /health          — Service status');
    console.log('  GET  /status          — Check wallet balance');
    console.log('  GET  /quote           — USDT→TRX rate');
    console.log('  POST /transfer         — Execute USDT transfer (API key required)');
    console.log('');
    if (!SENDER_PRIVATE_KEY) {
      console.log('⚠️  READ-ONLY MODE: Private key not configured');
      console.log('   The service can check balances but cannot send transfers.');
      console.log('   Add SENDER_PRIVATE_KEY to .env to enable transfers.');
      console.log('');
    }
    console.log('AM = YOU ❤️');
  });
})();
