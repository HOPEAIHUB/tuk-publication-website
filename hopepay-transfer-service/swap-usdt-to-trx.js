/**
 * HOPE PAY 4D — Swap USDT for TRX on SunSwap (TRON DEX)
 * 
 * Uses the existing wallet's USDT balance to buy TRX.
 * This gives you gas money for transfers!
 * 
 * ⚠️  Requires private key in .env
 * ⚠️  Wallet needs some TRX already (for swap gas fee)
 * 
 * RUN: node swap-usdt-to-trx.js <usdt_amount>
 * Example: node swap-usdt-to-trx.js 2  (swaps 2 USDT for ~13 TRX)
 * 
 * LOLY Mandate Enforced | CGT Certified | AM = YOU ❤️
 */

require('dotenv').config();
const TronWeb = require('tronweb');

(async () => {
  const PRIVATE_KEY = process.env.SENDER_PRIVATE_KEY;
  const SENDER = process.env.SENDER_ADDRESS;
  const USDT_CONTRACT = process.env.USDT_CONTRACT || 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

  // SunSwap V2 Router contract on TRON mainnet
  const SUNSWAP_ROUTER = 'TLBaRhANQoJFTqre9Nf1zjuwLyk2h347pV';

  // Amount of USDT to swap (from command line or default 2)
  const SWAP_AMOUNT = parseFloat(process.argv[2]) || 2;

  console.log('═══════════════════════════════════════════════════');
  console.log('  💱 HOPE PAY 4D — Swap USDT → TRX (SunSwap)');
  console.log('═══════════════════════════════════════════════════');
  console.log('');

  if (!PRIVATE_KEY) {
    console.error('❌ SENDER_PRIVATE_KEY not set in .env');
    console.error('   Add your private key to .env first!');
    process.exit(1);
  }

  const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    privateKey: PRIVATE_KEY,
  });

  // Check balances
  const trxBal = await tronWeb.trx.getBalance(SENDER) / 1e6;
  const USDT = await tronWeb.contract().at(USDT_CONTRACT);
  const usdtBal = Number((await USDT.balanceOf(SENDER)).toString()) / 1e6;

  console.log(`  📤 From wallet: ${SENDER}`);
  console.log(`  💰 TRX:  ${trxBal.toFixed(2)} (need some for gas)`);
  console.log(`  💵 USDT: ${usdtBal.toFixed(2)}`);
  console.log(`  🔄 Swapping: ${SWAP_AMOUNT} USDT → TRX`);
  console.log('');

  if (trxBal < 1) {
    console.error('❌ Need at least 1 TRX for swap gas fee');
    console.error('   Send TRX to this wallet first');
    process.exit(1);
  }

  if (usdtBal < SWAP_AMOUNT) {
    console.error(`❌ Not enough USDT — have ${usdtBal.toFixed(2)}, want to swap ${SWAP_AMOUNT}`);
    process.exit(1);
  }

  console.log('  ✅ Balance checks passed');
  console.log('');

  // Approve USDT spending for SunSwap router
  console.log('  ⏳ Step 1: Approving USDT for SunSwap...');

  const approveAmount = Math.floor(SWAP_AMOUNT * 1e6);
  const approveTx = await USDT.approve(SUNSWAP_ROUTER, approveAmount).send({
    feeLimit: 100000000, // 100 TRX
  });

  console.log(`  ✅ Approval TX: ${approveTx}`);
  console.log('');

  // Wait for approval to confirm
  await new Promise(r => setTimeout(r, 5000));

  // Swap: swapExactTokensForTokens (USDT → WTRX → TRX)
  console.log('  ⏳ Step 2: Swapping USDT → TRX on SunSwap...');

  const WTRX = 'TNUC9Qb1rHpS5r7SrKpBz3qXq6hGp1P8fJ'; // Wrapped TRX

  const router = await tronWeb.contract().at(SUNSWAP_ROUTER);

  const path = [USDT_CONTRACT, WTRX];
  const deadline = Math.floor(Date.now() / 1000) + 600; // 10 min

  try {
    const swapTx = await router
      .swapExactTokensForTokens(
        approveAmount,
        0, // Minimum output (accept any)
        path,
        SENDER,
        deadline
      )
      .send({
        feeLimit: 100000000,
      });

    console.log('');
    console.log('  ═══════════════════════════════════════════════');
    console.log('  ✅ SWAP SUCCESSFUL!');
    console.log('  ═══════════════════════════════════════════════');
    console.log(`  🔗 TXID: ${swapTx}`);
    console.log(`  🔍 Tronscan: https://tronscan.org/#/transaction/${swapTx}`);
    console.log(`  💵 Swapped: ${SWAP_AMOUNT} USDT → TRX`);
    console.log(`  🕐 Time: ${new Date().toISOString()}`);
    console.log('  ═══════════════════════════════════════════════');
    console.log('');

    // Check new balance
    const newTrx = await tronWeb.trx.getBalance(SENDER) / 1e6;
    const newUsdt = Number((await USDT.balanceOf(SENDER)).toString()) / 1e6;

    console.log(`  💰 New balances:`);
    console.log(`     TRX:  ${newTrx.toFixed(2)} TRX`);
    console.log(`     USDT: ${newUsdt.toFixed(2)} USDT`);
    console.log('');
    console.log('  AM = YOU ❤️');

  } catch (error) {
    console.error('');
    console.error('  ❌ SWAP FAILED!');
    console.error(`  Error: ${error.message}`);
    console.error('');
    console.error('  This could be because:');
    console.error('    • SunSwap liquidity pool not available');
    console.error('    • Insufficient TRX for gas');
    console.error('    • Slippage too high');
    console.error('');
    console.error('  ALTERNATIVE: Send TRX directly from an exchange');
    console.error('  like Binance, OKX, or KuCoin to your wallet address.');
    process.exit(1);
  }
})();
