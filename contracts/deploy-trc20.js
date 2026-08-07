/**
 * TUCB TRC20 Deployment Script — TRON Nile Testnet
 * 
 * Deploys all 12 TUK sovereign currency contracts on TRON testnet.
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

// TRON Nile Testnet Configuration
const TESTNET = {
  fullNode: 'https://nileex.io',
  solidityNode: 'https://nileex.io',
  eventServer: 'https://nileex.io',
};

// Production Mainnet (uncomment when ready)
// const MAINNET = {
//   fullNode: 'https://api.trongrid.io',
//   solidityNode: 'https://api.trongrid.io',
//   eventServer: 'https://api.trongrid.io',
// };

// Your private key — NEVER commit this to git!
const PRIVATE_KEY = process.env.TRON_PRIVATE_KEY;

if (!PRIVATE_KEY) {
  console.error('❌ ERROR: Set your private key first:');
  console.error('   export TRON_PRIVATE_KEY=your_private_key_here');
  console.error('');
  console.error('Get a testnet wallet at: https://nileex.io/join/getJoinPage');
  process.exit(1);
}

const tronWeb = new TronWeb(
  TESTNET.fullNode,
  TESTNET.solidityNode,
  TESTNET.eventServer,
  PRIVATE_KEY
);

// ============================================================
// 12 TUK Sovereign Currencies — Contract Bytecode & ABI
// ============================================================

// TRC20 Standard ABI (same for all tokens)
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
  { "inputs": [{ "internalType": "address", "name": "to", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [], "name": "lolVerified", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
];

// ============================================================
// Deployment function for a single TRC20 token
// ============================================================
async function deployToken(tokenConfig) {
  console.log(`\n🚀 Deploying ${tokenConfig.symbol} — ${tokenConfig.name}...`);
  console.log(`   Supply: ${tokenConfig.supply.toLocaleString()} tokens`);

  try {
    // Create contract instance
    const contract = await tronWeb.transactionBuilder.createSmartContract({
      abi: TRC20_ABI,
      bytecode: tokenConfig.bytecode,
      feeLimit: 1000000000, // 1000 TRX fee limit
      callValue: 0,
      parameters: [],
    });

    // Sign the transaction
    const signedTx = await tronWeb.trx.sign(contract, PRIVATE_KEY);

    // Broadcast
    const result = await tronWeb.trx.sendRawTransaction(signedTx);

    if (result.result) {
      const contractAddress = tronWeb.address.fromPrivateKey(PRIVATE_KEY);
      console.log(`   ✅ ${tokenConfig.symbol} deployed successfully!`);
      console.log(`   📍 Contract address will be visible on tronscan.org`);
      console.log(`   🔗 Tx: ${result.txid}`);
      return {
        symbol: tokenConfig.symbol,
        name: tokenConfig.name,
        supply: tokenConfig.supply,
        price: tokenConfig.price,
        txid: result.txid,
        success: true,
      };
    } else {
      console.log(`   ❌ ${tokenConfig.symbol} deployment failed`);
      return { symbol: tokenConfig.symbol, success: false, error: result.code };
    }
  } catch (error) {
    console.log(`   ❌ ${tokenConfig.symbol} error: ${error.message}`);
    return { symbol: tokenConfig.symbol, success: false, error: error.message };
  }
}

// ============================================================
// Test transfer function — send tokens between wallets
// ============================================================
async function testTransfer(fromAddress, toAddress, amount, tokenSymbol) {
  console.log(`\n💳 Test Transfer: ${amount} ${tokenSymbol}`);
  console.log(`   From: ${fromAddress}`);
  console.log(`   To:   ${toAddress}`);

  try {
    // In production, you would use the deployed contract address
    // const contract = await tronWeb.contract().at(contractAddress);
    // const result = await contract.transfer(toAddress, amount * 1e6).send();
    
    // For USDT TRC20 test transfer:
    // USDT contract on TRON mainnet: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t
    // const usdtContract = await tronWeb.contract().at('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');
    // const result = await usdtContract.transfer(toAddress, amount * 1e6).send({
    //   feeLimit: 100000000
    // });
    
    console.log(`   ⚠️  To execute this transfer:`);
    console.log(`   1. Open TronLink or Trust Wallet`);
    console.log(`   2. Switch to TRON Mainnet`);
    console.log(`   3. Send ${amount} ${tokenSymbol} (TRC20) to: ${toAddress}`);
    console.log(`   4. Verify on https://tronscan.org`);
    console.log(`   📝 This script shows instructions — actual transfer requires wallet signing`);
  } catch (error) {
    console.log(`   ❌ Transfer error: ${error.message}`);
  }
}

// ============================================================
// Main deployment function
// ============================================================
async function main() {
  console.log('============================================================');
  console.log('  TUCB TRC20 Deployment — TRON Nile Testnet');
  console.log('  12 TUK Sovereign Crypto Currencies');
  console.log('  LOLY Mandate Enforced | CGT Certified');
  console.log('============================================================');

  // Check wallet balance
  const address = tronWeb.address.fromPrivateKey(PRIVATE_KEY);
  console.log(`\n👤 Deployer address: ${address}`);
  
  const balance = await tronWeb.trx.getBalance(address);
  console.log(`💰 TRX balance: ${tronWeb.fromSun(balance)} TRX`);

  if (balance < 10000000) { // Less than 10 TRX
    console.log(`⚠️  Low balance! Get testnet TRX from: https://nileex.io/join/getJoinPage`);
    console.log(`   You need at least 600 TRX to deploy all 12 contracts.`);
  }

  // 12 TUK Currencies configuration
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

  console.log(`\n📊 Total tokens to deploy: ${tokens.length}`);
  console.log(`💰 Total market cap: $${tokens.reduce((s, t) => s + t.price * t.supply, 0).toLocaleString()}`);
  console.log(`💎 Total supply: ${tokens.reduce((s, t) => s + t.supply, 0).toLocaleString()}`);

  // Deploy each token
  const results = [];
  for (const token of tokens) {
    // Note: You need to compile the Solidity contracts first and get bytecode
    // For now, this script shows the deployment structure
    console.log(`\n📋 ${token.symbol} ready for deployment`);
    console.log(`   Name: ${token.name}`);
    console.log(`   Supply: ${token.supply.toLocaleString()}`);
    console.log(`   Price: $${token.price}`);
    console.log(`   Market Cap: $${(token.price * token.supply).toLocaleString()}`);
    results.push({ ...token, status: 'ready_for_bytecode' });
  }

  // Test transfer instructions
  console.log('\n============================================================');
  console.log('  TEST USDT TRANSFER INSTRUCTIONS');
  console.log('============================================================\n');
  
  await testTransfer(address, 'TATaPsa8c7DhicJ6wruQw1dADGvmiJHkRX', 10, 'USDT');
  
  console.log('\n============================================================');
  console.log('  HOPE PAY Wallet: TATaPsa8c7DhicJ6wruQw1dADGvmiJHkRX');
  console.log('  TUCB Treasury:   TAb8iv6UW8LrVctoxwGwFB6314iMvnhi3N');
  console.log('============================================================\n');

  console.log('📋 NEXT STEPS:');
  console.log('1. Compile contracts: Use https://remix.ethereum.org or Tron IDE');
  console.log('   Upload contracts/TUCB_All_12_TRC20.sol');
  console.log('   Compile with Solidity 0.8.0');
  console.log('2. Get bytecode for each contract');
  console.log('3. Run this script with bytecode to deploy on testnet');
  console.log('4. Verify contracts on https://nile.tronscan.org');
  console.log('5. Test transfers between wallets');
  console.log('6. When ready, switch to MAINNET and deploy for real');
  console.log('\n✅ Deployment package ready. AM = YOU ❤️');
}

main().catch(console.error);
