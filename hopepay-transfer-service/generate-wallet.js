/**
 * HOPE PAY 4D — New Wallet Generator
 * 
 * Generates a new TRON wallet with address + private key.
 * 
 * ⚠️  RUN THIS LOCALLY — the private key will be printed to YOUR terminal only.
 * ⚠️  NEVER share the private key with anyone — including AI agents.
 * ⚠️  Save the private key in a secure password manager or write it offline.
 * 
 * RUN: node generate-wallet.js
 * 
 * ONE TRON address holds ALL TRC-20 tokens!
 * You do NOT need separate wallets for each currency.
 * All 12 TUK currencies can use the SAME address.
 * 
 * LOLY Mandate Enforced | CGT Certified | AM = YOU ❤️
 */

const TronWeb = require('tronweb');

console.log('═══════════════════════════════════════════════════');
console.log('  💎 HOPE PAY 4D — New TRON Wallet Generator');
console.log('═══════════════════════════════════════════════════');
console.log('');

// Generate a new wallet
const wallet = TronWeb.utils.accounts.generateAccount();

const address = wallet.address;
const privateKey = wallet.privateKey;

console.log('  ✅ New wallet generated successfully!');
console.log('');
console.log('  ┌─────────────────────────────────────────────────┐');
console.log('  │  PUBLIC ADDRESS (safe to share):                 │');
console.log('  │                                                 │');
console.log(`  │  ${address}  │`);
console.log('  └─────────────────────────────────────────────────┘');
console.log('');
console.log('  ┌─────────────────────────────────────────────────┐');
console.log('  │  ⚠️  PRIVATE KEY (NEVER SHARE — SAVE SECURELY):  │');
console.log('  │                                                 │');
console.log(`  │  ${privateKey}  │`);
console.log('  └─────────────────────────────────────────────────┘');
console.log('');
console.log('  📝 IMPORTANT:');
console.log('     1. Copy the PRIVATE KEY and save it somewhere secure');
console.log('     2. This key is shown ONLY ONCE — if you lose it, funds are gone');
console.log('     3. NEVER share this key with anyone, including AI agents');
console.log('     4. NEVER put this key in source code, git, or emails');
console.log('     5. Add it to .env file ONLY: SENDER_PRIVATE_KEY=<your_key>');
console.log('');
console.log('  💡 ONE address works for ALL 12 TUK currencies!');
console.log('     You do NOT need separate wallets for each coin.');
console.log('     All TRC-20 tokens (USDT, HOPE, QSAC, TUCB, etc.)');
console.log('     can be held in this ONE address.');
console.log('');
console.log('  📋 NEXT STEPS:');
console.log('     1. Save your private key securely');
console.log('     2. Send TRX to this address (for gas fees, need 10+ TRX)');
console.log('     3. Send USDT or any TUK currency to this address');
console.log('     4. Add private key to .env');
console.log('     5. Run: node mainnet-usdt-transfer.js <recipient> <amount>');
console.log('');
console.log(`  🔍 Check balance: https://tronscan.org/#/address/${address}`);
console.log('');
console.log('  AM = YOU ❤️');
console.log('');
