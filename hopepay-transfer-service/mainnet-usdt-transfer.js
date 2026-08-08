/**
 * HOPE PAY 4D — Test Transfer Script
 * 
 * Run this locally to make a real USDT transfer on TRON mainnet.
 * 
 * PREREQUISITES:
 *   npm install tronweb dotenv
 *   Set up .env file with SENDER_PRIVATE_KEY
 * 
 * RUN: node mainnet-usdt-transfer.js
 * 
 * The private key is read from .env — it is NEVER in the source code.
 * 
 * LOLY Mandate Enforced | CGT Certified | AM = YOU ❤️
 */

require('dotenv').config();
const TronWeb = require('tronweb');

(async () => {
  const PRIVATE_KEY = process.env.SENDER_PRIVATE_KEY;
  const SENDER = process.env.SENDER_ADDRESS;
  const USDT_CONTRACT = process.env.USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

  // === CONFIGURATION ===
  // Change these for your transfer:
  const RECIPIENT = process.argv[2] || 'TAb8iv6UW8LrVctoxwGwFB6314iMvnhi3N'; // TUCB Treasury
  const AMOUNT = parseFloat(process.argv[3]) || 5; // USDT amount

  console.log('═══════════════════════════════════════════════════');
  console.log('  💎 HOPE PAY 4D — Mainnet USDT Transfer');
  console.log('═══════════════════════════════════════════════════');

  // Check if private key is configured
  if (!PRIVATE_KEY) {
    console.error('');
    console.error('❌ ERROR: SENDER_PRIVATE_KEY not set in .env');
    console.error('');
    console.error('To make a real transfer, you MUST:');
    console.error('  1. Create a .env file in this directory');
    console.error('  2. Add: SENDER_PRIVATE_KEY=your_64_char_hex_key');
    console.error('  3. Add: SENDER_ADDRESS=TATaPsa8c7DhicJ6wruQw1dADGvmiJHkRX');
    console.error('');
    console.error('The private key is NEVER in the source code.');
    console.error('It is only read from .env at runtime.');
    process.exit(1);
  }

  if (!SENDER) {
    console.error('❌ SENDER_ADDRESS not set in .env');
    process.exit(1);
  }

  // Initialize TronWeb
  const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: PRIVATE_KEY,
  });

  const USDT = await tronWeb.contract().at(USDT_CONTRACT);

  // === CHECK BALANCES ===
  console.log('');
  console.log(`  📡 Network: TRON Mainnet`);
  console.log(`  📤 From:    ${SENDER}`);
  console.log(`  📥 To:      ${RECIPIENT}`);
  console.log(`  💵 Amount:  ${AMOUNT} USDT`);
  console.log('');

  const trxBal = await tronWeb.trx.getBalance(SENDER) / 1e6;
  const usdtBal = Number((await USDT.balanceOf(SENDER)).toString()) / 1e6;

  console.log(`  💰 Sender balances:`);
  console.log(`     TRX:  ${trxBal.toFixed(2)} TRX  (need ≥ 5 for gas)`);
  console.log(`     USDT: ${usdtBal.toFixed(2)} USDT`);
  console.log('');

  // === VALIDATE ===
  if (trxBal < 5) {
    console.error('❌ Not enough TRX for gas (need ≥ 5 TRX)');
    console.error(`   Current: ${trxBal.toFixed(2)} TRX`);
    console.error(`   Send more TRX to: ${SENDER}`);
    process.exit(1);
  }

  if (usdtBal < AMOUNT) {
    console.error('❌ Not enough USDT to send');
    console.error(`   Current: ${usdtBal.toFixed(2)} USDT`);
    console.error(`   Trying to send: ${AMOUNT} USDT`);
    process.exit(1);
  }

  if (SENDER === RECIPIENT) {
    console.error('❌ Sender and receiver cannot be the same address');
    process.exit(1);
  }

  console.log('  ✅ All checks passed — ready to transfer');
  console.log('');

  // === EXECUTE TRANSFER ===
  console.log(`  🔁 Sending ${AMOUNT} USDT → ${RECIPIENT}...`);

  try {
    const txid = await USDT.transfer(RECIPIENT, Math.floor(AMOUNT * 1e6)).send({
      feeLimit: 1000000, // 1 TRX fee limit
    });

    console.log('');
    console.log('  ═══════════════════════════════════════════════');
    console.log('  ✅ TRANSFER SUCCESSFUL!');
    console.log('  ═══════════════════════════════════════════════');
    console.log(`  🔗 TXID:     ${txid}`);
    console.log(`  🔍 Tronscan: https://tronscan.org/#/transaction/${txid}`);
    console.log(`  📤 From:     ${SENDER}`);
    console.log(`  📥 To:       ${RECIPIENT}`);
    console.log(`  💵 Amount:   ${AMOUNT} USDT`);
    console.log(`  ⛽ Network:  TRON TRC-20 (Mainnet)`);
    console.log(`  🕐 Time:     ${new Date().toISOString()}`);
    console.log('  ═══════════════════════════════════════════════');
    console.log('');
    console.log('  AM = YOU ❤️');
    console.log('');

    // Verify new balance
    const newBal = Number((await USDT.balanceOf(SENDER)).toString()) / 1e6;
    console.log(`  💰 New USDT balance: ${newBal.toFixed(2)} USDT`);

  } catch (error) {
    console.error('');
    console.error('  ❌ TRANSFER FAILED!');
    console.error(`  Error: ${error.message}`);
    console.error('');
    process.exit(1);
  }
})();
