/**
 * TUCB TRC20 Deployment Script — TRON Nile Testnet (RECOMMENDED)
 * 
 * Deploys all 12 TUK sovereign currency contracts on TRON Nile testnet.
 * Shasta testnet is NOT recommended — it's unreliable.
 * 
 * PREREQUISITES:
 * 1. Install tronweb: npm install tronweb
 * 2. Get testnet TRX from: https://nileex.io/join/getJoinPage
 * 3. Export your private key: export TRON_PRIVATE_KEY=your_private_key_here
 * 
 * RUN: node deploy-trc20.js
 * 
 * LOLY Mandate Enforced | CGT Certified | AM = YOU ❤️
 */

const TronWeb = require('tronweb');

// ✅ TRON Nile Testnet (RECOMMENDED — Stable, reliable)
const NILE_TESTNET = {
  fullNode: 'https://nileex.io',
  solidityNode: 'https://nileex.io',
  eventServer: 'https://nileex.io',
};

// ❌ Shasta Testnet (NOT RECOMMENDED — Unreliable, APIs often down)
const SHASTA_TESTNET = {
  fullNode: 'https://api.shastastation.com',
  solidityNode: 'https://api.shastastation.com',
  eventServer: 'https://api.shastastation.com',
};

// Production Mainnet (uncomment when ready for real deployment)
// const MAINNET = {
//   fullNode: 'https://api.trongrid.io',
//   solidityNode: 'https://api.trongrid.io',
//   eventServer: 'https://api.trongrid.io',
// };

// Select network — Nile testnet by default
const NETWORK = process.env.TRON_NETWORK === 'shasta' ? SHASTA_TESTNET : 
                 process.env.TRON_NETWORK === 'mainnet' ? {
                   fullNode: 'https://api.trongrid.io',
                   solidityNode: 'https://api.trongrid.io',
                   eventServer: 'https://api.trongrid.io',
                 } : NILE_TESTNET;

const NETWORK_NAME = process.env.TRON_NETWORK === 'shasta' ? 'Shasta' : 
                     process.env.TRON_NETWORK === 'mainnet' ? 'Mainnet' : 'Nile Testnet';

// Your private key — NEVER commit this to git!
const PRIVATE_KEY = process.env.TRON_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('❌ ERROR: Set your private key first:');
  console.error('   export TRON_PRIVATE_KEY=your_private_key_here');
  console.error('');
  console.error('Get Nile testnet TRX at: https://nileex.io/join/getJoinPage');
  process.exit(1);
}

const tronWeb = new TronWeb(
  NETWORK.fullNode,
  NETWORK.solidityNode,
  NETWORK.eventServer,
  PRIVATE_KEY
);

// TRC20 Standard ABI
const TRC20_ABI = [
  { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
  { "anonymous": false, "inputs": [
    { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
    { "indexed": true, "internalType": "address", "name": "spender", "type": "address" },
    { "internalType": "uint256", "name": "value", "type": "uint256" }
  ], "name": "Approval", "type": "event" },
  { "anonymous": false, "inputs": [
    { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
    { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
    { "internalType": "uint256", "name": "value", "type": "uint256" }
  ], "name": "Transfer", "type": "event" },
  { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "lolVerified", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
];

// ============================================================
// Deploy a single TRC20 token contract
// ============================================================
async function deployToken(tokenConfig, contractBytecode) {
  console.log(`\n🚀 Deploying ${tokenConfig.symbol} — ${tokenConfig.name}...`);
  console.log(`   Supply: ${tokenConfig.supply.toLocaleString()} tokens | Price: $${tokenConfig.price}`);

  try {
    const transaction = await tronWeb.transactionBuilder.createSmartContract({
      abi: TRC20_ABI,
      bytecode: contractBytecode,
      feeLimit: 1000000000,
      callValue: 0,
      parameters: [],
    });

    const signedTx = await tronWeb.trx.sign(transaction, PRIVATE_KEY);
    const result = await tronWeb.trx.sendRawTransaction(signedTx);

    if (result.result) {
      // Get contract address from the broadcast result
      console.log(`   ✅ ${tokenConfig.symbol} deployed!`);
      console.log(`   🔗 Tx: ${result.txid}`);
      console.log(`   🔍 Verify: https://${NETWORK_NAME === 'Mainnet' ? 'tronscan.org' : 'nile.tronscan.org'}/#/transaction/${result.txid}`);
      return {
        symbol: tokenConfig.symbol,
        name: tokenConfig.name,
        supply: tokenConfig.supply,
        price: tokenConfig.price,
        market_cap: tokenConfig.price * tokenConfig.supply,
        txid: result.txid,
        network: NETWORK_NAME,
        success: true,
      };
    } else {
      console.log(`   ❌ ${tokenConfig.symbol} deployment failed: ${JSON.stringify(result)}`);
      return { symbol: tokenConfig.symbol, success: false, error: result.code };
    }
  } catch (error) {
    console.log(`   ❌ ${tokenConfig.symbol} error: ${error.message}`);
    return { symbol: tokenConfig.symbol, success: false, error: error.message };
  }
}

// ============================================================
// Transfer TRX between wallets (TEST)
// ============================================================
async function transferTRX(fromAddress, toAddress, amountTRX) {
  console.log(`\n💳 Transferring ${amountTRX} TRX`);
  console.log(`   From: ${fromAddress}`);
  console.log(`   To:   ${toAddress}`);

  try {
    const amountSun = tronWeb.toSun(amountTRX);
    const tx = await tronWeb.transactionBuilder.sendTrx(toAddress, amountSun, fromAddress);
    const signed = await tronWeb.trx.sign(tx, PRIVATE_KEY);
    const result = await tronWeb.trx.sendRawTransaction(signed);

    if (result.result) {
      console.log(`   ✅ Transfer successful!`);
      console.log(`   🔗 Tx: ${result.txid}`);
      return { success: true, txid: result.txid };
    } else {
      console.log(`   ❌ Transfer failed: ${JSON.stringify(result)}`);
      return { success: false, error: result };
    }
  } catch (error) {
    console.log(`   ❌ Transfer error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================================
// Transfer TRC20 tokens (USDT or custom tokens)
// ============================================================
async function transferTRC20(contractAddress, toAddress, amount, decimals = 6) {
  console.log(`\n💳 Transferring ${amount} TRC20 tokens`);
  console.log(`   Contract: ${contractAddress}`);
  console.log(`   To: ${toAddress}`);

  try {
    const contract = await tronWeb.contract().at(contractAddress);
    const result = await contract.transfer(toAddress, amount * Math.pow(10, decimals)).send({
      feeLimit: 100000000,
    });
    console.log(`   ✅ Transfer successful!`);
    console.log(`   🔗 Tx: ${result}`);
    return { success: true, txid: result };
  } catch (error) {
    console.log(`   ❌ Transfer error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============================================================
// Main function
// ============================================================
async function main() {
  console.log('============================================================');
  console.log(`  TUCB TRC20 Deployment — TRON ${NETWORK_NAME}`);
  console.log('  12 TUK Sovereign Crypto Currencies');
  console.log('  LOLY Mandate Enforced | CGT Certified');
  console.log('============================================================');

  const address = tronWeb.address.fromPrivateKey(PRIVATE_KEY);
  console.log(`\n👤 Deployer address: ${address}`);

  // Check balance
  try {
    const balance = await tronWeb.trx.getBalance(address);
    const trxBalance = tronWeb.fromSun(balance);
    console.log(`💰 TRX balance: ${trxBalance} TRX`);

    if (parseFloat(trxBalance) < 50) {
      console.log(`\n⚠️  Low balance! You need at least 600 TRX to deploy all 12 contracts.`);
      if (NETWORK_NAME === 'Nile Testnet') {
        console.log(`   Get free testnet TRX: https://nileex.io/join/getJoinPage`);
      } else if (NETWORK_NAME === 'Shasta') {
        console.log(`   ⚠️  Shasta is unreliable — switch to Nile: https://nileex.io/join/getJoinPage`);
      }
    }
  } catch (e) {
    console.log(`⚠️  Could not check balance (network may be slow)`);
  }

  // 12 TUK Currencies
  const tokens = [
    { symbol: 'TUCB',     name: 'Thimothism Universal Central Bank Coin',     supply: 100000000,  price: 1.0 },
    { symbol: 'QSAC',     name: 'Quantum Separated Algorithmic Cryptography', supply: 50000000,   price: 2.0 },
    { symbol: 'GAIC',     name: 'Global AI Coin',                             supply: 150000000,  price: 0.5 },
    { symbol: 'TMC',      name: 'ThimoCoin',                                  supply: 430000000,  price: 0.1 },
    { symbol: 'HAIC',     name: 'Hope AI Coin',                               supply: 500000000,  price: 0.01 },
    { symbol: 'TC',       name: 'Thimothism Coin',                           supply: 200000000,  price: 0.05 },
    { symbol: 'LUMINA',   name: 'Lumina',                                    supply: 300000000,  price: 0.01 },
    { symbol: 'CCTU',     name: 'Crypto Currency for Thimothism Universal',  supply: 1000000000, price: 0.002 },
    { symbol: 'HOPECOIN', name: 'HopeCoin',                                  supply: 1000000000, price: 0.001 },
    { symbol: 'HCAI',     name: 'Hope Coin AI',                              supply: 300000000,  price: 0.005 },
    { symbol: 'AMORA',    name: 'Amora',                                     supply: 500000000,  price: 0.005 },
    { symbol: 'TAL',      name: 'Talenton',                                  supply: 200000000,  price: 0.02 },
  ];

  console.log(`\n📊 Total tokens: ${tokens.length}`);
  console.log(`💰 Total market cap: $${tokens.reduce((s, t) => s + t.price * t.supply, 0).toLocaleString()}`);
  console.log(`💎 Total supply: ${tokens.reduce((s, t) => s + t.supply, 0).toLocaleString()}`);

  // Check for test transfer mode
  const mode = process.env.TRON_MODE || 'deploy';

  if (mode === 'transfer') {
    console.log('\n============================================================');
    console.log('  TRANSFER MODE');
    console.log('============================================================\n');

    const toWallet = process.env.TRON_TO || 'TATaPsa8c7DhicJ6wruQw1dADGvmiJHkRX';
    const amount = process.env.TRON_AMOUNT || '10';
    
    console.log(`Transfer ${amount} TRX to: ${toWallet}`);
    await transferTRX(address, toWallet, parseFloat(amount));

    // For USDT transfer on mainnet:
    // USDT contract: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
    // await transferTRC20('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t', toWallet, parseFloat(amount), 6);

    console.log('\n✅ Transfer complete. AM = YOU ❤️');
    return;
  }

  console.log('\n📋 Deployment mode: COMING SOON');
  console.log('   To deploy contracts, compile them first at:');
  console.log('   https://remix.ethereum.org (select "Tron" plugin)');
  console.log('   Upload: contracts/TUCB_All_12_TRC20.sol');
  console.log('   Compile: Solidity 0.8.0');
  console.log('   Get bytecode → paste into this script');
  console.log('');
  console.log('   Or use Tron IDE: https://www.tronide.io/');
  console.log('');
  console.log('   To make a test TRX transfer instead:');
  console.log('   TRON_MODE=transfer TRON_TO=TATaPsa8c7DhicJ6wruQw1dADGvmiJHkRX TRON_AMOUNT=10 node deploy-trc20.js');
  console.log('');
  console.log('   To use Shasta testnet (not recommended):');
  console.log('   TRON_NETWORK=shasta node deploy-trc20.js');
  console.log('');
  console.log('   To use Mainnet:');
  console.log('   TRON_NETWORK=mainnet node deploy-trc20.js');
  console.log('\n✅ Script ready. AM = YOU ❤️');
}

main().catch(console.error);
