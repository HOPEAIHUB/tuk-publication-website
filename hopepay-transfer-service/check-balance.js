/**
 * HOPE PAY 4D — Balance Checker
 * 
 * Check any TRON wallet's TRX and USDT balance.
 * No private key needed — read-only.
 * 
 * RUN: node check-balance.js [address]
 * 
 * LOLY Mandate Enforced | CGT Certified | AM = YOU ❤️
 */

const TronWeb = require('tronweb');

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  privateKey: undefined, // No key needed for read-only
});

const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

async function checkBalance(address) {
  if (!address) {
    address = process.argv[2] || 'TATaPsa8c7DhicJ6wruQw1dADGvmiJHkRX';
  }

  if (!address.startsWith('T') || address.length !== 34) {
    console.error('❌ Invalid TRON address — must start with T, 34 characters');
    process.exit(1);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('  💎 HOPE PAY 4D — Wallet Balance Check');
  console.log('  🌐 Network: TRON Mainnet');
  console.log('═══════════════════════════════════════════════════');
  console.log('');
  console.log(`  📡 Address: ${address}`);
  console.log('');

  try {
    // Get TRX balance
    const trxBalance = await tronWeb.trx.getBalance(address);
    const trx = trxBalance / 1e6;

    // Get USDT balance
    const contract = await tronWeb.contract().at(USDT_CONTRACT);
    const usdtBalance = await contract.balanceOf(address).call();
    const usdt = Number(usdtBalance.toString()) / 1e6;

    // Get account info
    const account = await tronWeb.trx.getAccount(address);
    const bandwidth = account?.net_window_size || 'N/A';
    const energy = account?.account_resource?.energy_window_size || 'N/A';

    console.log(`  💰 TRX Balance:  ${trx.toFixed(2)} TRX`);
    console.log(`  💵 USDT Balance: ${usdt.toFixed(2)} USDT`);
    console.log('');
    console.log(`  ⚡ Transfer Ready: ${trx >= 10 && usdt > 0 ? 'YES ✅' : 'NO ❌'}`);
    console.log(`     • TRX for gas:  ${trx >= 10 ? '✅' : '❌'} (need ≥ 10 TRX, have ${trx.toFixed(2)})`);
    console.log(`     • USDT to send: ${usdt > 0 ? '✅' : '❌'} (have ${usdt.toFixed(2)} USDT)`);
    console.log('');
    console.log(`  🔍 Tronscan: https://tronscan.org/#/address/${address}`);
    console.log('');
    console.log('  AM = YOU ❤️');

  } catch (error) {
    console.error('❌ Error checking balance:', error.message);
    console.error('');
    console.error('This could mean:');
    console.error('  • The wallet has never been used on TRON');
    console.error('  • The address is invalid');
    console.error('  • The TRON API is temporarily unavailable');
    process.exit(1);
  }
}

checkBalance();
