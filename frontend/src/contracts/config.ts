// Contract configuration
// Contract ID must be set in environment variables
export const CONTRACT_ID = import.meta.env.VITE_CONTRACT_ID || '';

// Treasury address - receives payment from NFT mints
// This is the contract owner/admin address
// Must be set in environment variables
export const TREASURY_ADDRESS = import.meta.env.VITE_TREASURY_ADDRESS || '';

// Network configuration
export const NETWORK = (import.meta.env.VITE_STELLAR_NETWORK || 'testnet') as 'testnet' | 'mainnet';

// Soroban RPC URLs
export const SOROBAN_RPC_URL = NETWORK === 'mainnet'
  ? 'https://rpc.mainnet.stellar.org:443'
  : 'https://soroban-testnet.stellar.org';
  
// Validate RPC URL
if (!SOROBAN_RPC_URL) {
  console.error('SOROBAN_RPC_URL is not configured');
}

// Horizon URLs (for transaction submission)
export const HORIZON_URL = NETWORK === 'mainnet'
  ? 'https://horizon.stellar.org'
  : 'https://horizon-testnet.stellar.org';





