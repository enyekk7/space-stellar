// Scaffold Stellar Configuration
export default {
  network: process.env.STELLAR_NETWORK || 'testnet',
  contractId: process.env.CONTRACT_ID || '',
  rpcUrl: process.env.RPC_URL || 'https://soroban-testnet.stellar.org',
  networkPassphrase: process.env.STELLAR_NETWORK === 'mainnet'
    ? 'Public Global Stellar Network ; September 2015'
    : 'Test SDF Network ; September 2015',
};







