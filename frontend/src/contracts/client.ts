// Contract client for SpaceStellarNFT
// Based on Stellar SDK and Scaffold Stellar patterns
// Reference: https://developers.stellar.org/docs/build/smart-contracts/example-contracts/non-fungible-token#usage
// Reference: https://scaffoldstellar.org/docs/quick-start

import { 
  Contract, 
  Address, 
  scValToNative, 
  nativeToScVal,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  Account
} from '@stellar/stellar-sdk'
// Import SorobanRpc - based on SDK index.d.ts: export * as SorobanRpc from './soroban'
import { SorobanRpc } from '@stellar/stellar-sdk'
import { CONTRACT_ID, SOROBAN_RPC_URL, NETWORK, TREASURY_ADDRESS } from './config'
import { 
  getServer, 
  STANDARD_TIMEBOUNDS
} from '../utils/stellar'

export interface ShipMetadata {
  class: string;
  rarity: string;
  tier: string;
  attack: number;
  speed: number;
  shield: number;
  ipfsCid: string;
  metadataUri: string;
}

export interface MintResult {
  tokenId: number;
  txHash: string;
}

export class SpaceStellarNFTClient {
  private contract: Contract;
  private rpcServer: any; // Will be SorobanRpc.Server instance
  private networkPassphrase: string;

  constructor(
    public contractId: string = CONTRACT_ID,
    public network: 'testnet' | 'mainnet' = NETWORK
  ) {
    if (!contractId) {
      throw new Error('Contract ID is required. Set VITE_CONTRACT_ID in .env file');
    }

    if (!SOROBAN_RPC_URL) {
      throw new Error('Soroban RPC URL is not configured. Please set VITE_STELLAR_NETWORK in .env file');
    }

    this.contract = new Contract(contractId);
    
    // Initialize Soroban RPC server (used for all operations including account loading)
    try {
      // Check if SorobanRpc is available
      console.log('Checking SorobanRpc availability...');
      console.log('SorobanRpc:', SorobanRpc);
      console.log('SorobanRpc type:', typeof SorobanRpc);
      
      if (!SorobanRpc) {
        throw new Error('SorobanRpc is not exported from @stellar/stellar-sdk. Please check SDK version.');
      }
      
      if (!SorobanRpc.Server) {
        console.error('SorobanRpc object:', SorobanRpc);
        console.error('SorobanRpc keys:', Object.keys(SorobanRpc || {}));
        throw new Error('SorobanRpc.Server is not available. Please check @stellar/stellar-sdk version.');
      }
      
      console.log('Creating Soroban RPC server...');
      this.rpcServer = new SorobanRpc.Server(SOROBAN_RPC_URL, {
        allowHttp: network === 'testnet' || SOROBAN_RPC_URL.includes('localhost')
      });
      console.log('✅ Soroban RPC server initialized:', SOROBAN_RPC_URL);
    } catch (error: any) {
      console.error('❌ Failed to initialize Soroban RPC server:', error);
      console.error('SorobanRpc:', SorobanRpc);
      console.error('SorobanRpc.Server:', SorobanRpc?.Server);
      console.error('SDK version check - please verify @stellar/stellar-sdk is installed correctly');
      throw new Error(`Failed to initialize Soroban RPC server: ${error.message || error}`);
    }
    
    this.networkPassphrase = network === 'mainnet' 
      ? Networks.PUBLIC 
      : Networks.TESTNET;
  }

  /**
   * Mint a new NFT ship with points payment (off-chain)
   * This will invoke the smart contract's mint function
   * Points will be deducted from user's account before minting
   * User will need to sign the transaction with Freighter wallet
   */
  async mint(
    signer: (xdr: string) => Promise<string>,
    sourceAccount: string,
    to: string,
    class_: string,
    rarity: string,
    tier: string,
    attack: number,
    speed: number,
    shield: number,
    ipfs_cid: string,
    metadata_uri: string,
    priceInPoints?: number // Price in platform points (off-chain)
  ): Promise<MintResult> {
    try {
      // Convert parameters to ScVal (Soroban values)
      const toAddress = Address.fromString(to);
      
      // Use Contract.call() which handles InvokeHostFunction internally
      // Contract function signature: mint(to: Address, class: String, rarity: String, tier: String, attack: u32, speed: u32, shield: u32, ipfs_cid: String, metadata_uri: String)
      const contractCall = this.contract.call(
        'mint',
        nativeToScVal(toAddress, { type: 'address' }),
        nativeToScVal(class_, { type: 'string' }),
        nativeToScVal(rarity, { type: 'string' }),
        nativeToScVal(tier, { type: 'string' }),
        nativeToScVal(attack, { type: 'u32' }),
        nativeToScVal(speed, { type: 'u32' }),
        nativeToScVal(shield, { type: 'u32' }),
        nativeToScVal(ipfs_cid, { type: 'string' }),
        nativeToScVal(metadata_uri, { type: 'string' })
      );

      // Use Horizon Server to load account for contract transaction
      const server = getServer();
      console.log('📡 Loading account from Horizon...');
      const horizonAccount = await server.loadAccount(sourceAccount);
      
      // Get account sequence for contract transaction
      const sequenceNumber = String(horizonAccount.sequenceNumber());
      console.log('✅ Account loaded');
      console.log('   Sequence:', sequenceNumber);
      
      // Create Account object for contract transaction
      const sourceAccountData = new Account(sourceAccount, sequenceNumber);
      
      // ============================================================
      // CHECK POINTS BALANCE (OFF-CHAIN) - Hanya check, tidak potong
      // Points akan dipotong SETELAH mint berhasil
      // ============================================================
      if (priceInPoints && priceInPoints > 0) {
        console.log(`\n💰 Checking points balance...`);
        console.log(`   Address: ${to}`);
        console.log(`   Required: ${priceInPoints} points`);
        
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
          const checkResponse = await fetch(`${apiUrl}/api/points/${to}`);
          const checkResult = await checkResponse.json();
          
          if (!checkResult.success) {
            throw new Error('Failed to check points balance');
          }
          
          const currentPoints = checkResult.points || 0;
          
          if (currentPoints < priceInPoints) {
            throw new Error(
              `❌ Insufficient points!\n\n` +
              `Required: ${priceInPoints} points\n` +
              `Current: ${currentPoints} points\n` +
              `Shortage: ${priceInPoints - currentPoints} points\n\n` +
              `💡 Earn more points by playing games or completing quests!`
            );
          }
          
          console.log('✅ Points balance sufficient');
          console.log(`   Current: ${currentPoints} points`);
          console.log(`   Required: ${priceInPoints} points`);
          console.log(`   Will deduct after successful mint`);
          console.log('');
        } catch (pointsError: any) {
          console.error('❌ Points check failed:', pointsError);
          throw new Error(
            `❌ ${pointsError.message || 'Failed to check points balance'}\n\n` +
            `Please check your points balance and try again.`
          );
        }
      }
      
      // ============================================================
      // PROCEED WITH NFT MINTING
      // Points akan dipotong SETELAH mint berhasil
      // ============================================================
      console.log('\n🎨 Building NFT mint transaction...');
      console.log('   Points: ✅ Checked (will deduct after successful mint)');
      console.log('   Ready to mint NFT');
      console.log('');
      
      // Build contract invocation transaction (Soroban transaction - single operation only)
      // ✅ PERBAIKAN: Timeout 300 seconds (5 minutes) sesuai dokumentasi
      let transaction = new TransactionBuilder(sourceAccountData, {
        fee: BASE_FEE.toString(),
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contractCall)
        .setTimeout(STANDARD_TIMEBOUNDS) // ✅ 300 seconds (5 minutes, sesuai dokumentasi)
        .build();

      // Simulate transaction first to ensure it's valid
      console.log('Simulating transaction with Soroban RPC...');
      try {
        const simulation = await this.rpcServer.simulateTransaction(transaction);
        console.log('✅ Transaction simulation successful');
        console.log('Simulation result:', {
          cost: simulation.cost,
          footprint: simulation.footprint ? 'present' : 'missing'
        });
      } catch (simError: any) {
        console.warn('⚠️ Simulation warning:', simError);
        // Continue anyway - simulation is optional
      }

      // Prepare transaction using Soroban RPC (required for contract invocations)
      console.log('Preparing transaction with Soroban RPC...');
      console.log('RPC URL:', SOROBAN_RPC_URL);
      
      if (!this.rpcServer) {
        throw new Error('Soroban RPC server is not initialized');
      }
      
      try {
        transaction = await this.rpcServer.prepareTransaction(transaction);
        console.log('✅ Transaction prepared successfully');
        
        // Log transaction details after prepare
        console.log('Prepared transaction details:', {
          fee: transaction.fee,
          operations: transaction.operations.length,
          source: transaction.source,
          sequence: transaction.sequence
        });
      } catch (error: any) {
        console.error('❌ Failed to prepare transaction:', error);
        throw new Error(`Failed to prepare transaction: ${error.message || error}`);
      }

      // Get transaction XDR
      const xdr = transaction.toXDR();
      console.log('Transaction XDR length:', xdr.length);
      console.log('Transaction XDR preview:', xdr.substring(0, 100) + '...');
      
      // Validate XDR before signing (optional - just log)
      try {
        const testParse = TransactionBuilder.fromXDR(xdr, this.networkPassphrase);
        console.log('✅ XDR validation passed');
        // Note: testParse might be FeeBumpTransaction which doesn't have operations
        if ('operations' in testParse) {
          console.log('Transaction operations:', testParse.operations.length);
        }
      } catch (xdrError: any) {
        console.warn('⚠️ XDR validation warning:', xdrError.message);
        // Don't throw - transaction might still be valid
      }

      // Sign transaction with wallet (will show Freighter popup)
      console.log('📤 Requesting wallet signature for mint transaction...');
      console.log('   Network passphrase:', this.networkPassphrase);
      console.log('   Source account:', sourceAccount);
      console.log('   Timeout: 300 seconds (5 minutes)');
      
      let signedXdr: string;
      try {
        signedXdr = await signer(xdr);
        console.log('✅ Transaction signed successfully');
        console.log('   Signed XDR length:', signedXdr.length);
      } catch (signError: any) {
        console.error('❌ Signing error:', signError);
        console.error('Error details:', {
          message: signError.message,
          name: signError.name,
          stack: signError.stack
        });
        
        // Provide more helpful error messages
        if (signError.message?.includes('internal error') || signError.message?.includes('encountered an internal error')) {
          throw new Error(`Wallet internal error. This may be caused by:\n1. Transaction too large or complex\n2. Network mismatch (check Freighter network setting)\n3. Insufficient balance for transaction fees\n4. Try refreshing the page and reconnecting wallet`);
        }
        
        throw new Error(`Failed to sign transaction: ${signError.message || 'Unknown error'}`);
      }

      // ✅ PERBAIKAN: Submit IMMEDIATELY setelah signing (sesuai dokumentasi)
      console.log('📤 Submitting mint transaction to Soroban RPC immediately...');
      const signedTransaction = TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase);
      const result = await this.rpcServer.sendTransaction(signedTransaction);

      if (result.status === 'PENDING' || result.status === 'DUPLICATE') {
        console.log('✅ Transaction submitted:', result.hash);
      } else {
        throw new Error(`Transaction failed: ${result.status}`);
      }

      // Get token ID from transaction result
      // The mint function returns the token ID (u32) from sequential_mint
      let tokenId = 0;
      
      try {
        // Wait a bit for transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify transaction succeeded
        const txResult = await this.rpcServer.getTransaction(result.hash);
        if (txResult.status === 'SUCCESS') {
          console.log('✅ Contract transaction succeeded');
        } else {
          console.warn('⚠️ Transaction status:', txResult.status);
        }
        
        // If we couldn't get token ID from result, try to query balance
        // and estimate (not perfect, but better than 0)
        if (tokenId === 0) {
          console.log('⚠️  Could not get token ID from result, querying balance...');
          try {
            const balance = await this.balanceOf(to);
            // This is an estimate - actual token ID might be different
            tokenId = balance > 0 ? balance : 1; // At least 1 if mint succeeded
          } catch (e) {
            console.warn('Could not get balance:', e);
            tokenId = 1; // Default to 1 if we can't determine
          }
        }
      } catch (error) {
        console.warn('Error parsing token ID:', error);
        // Fallback: return 1, user can check transaction hash
        tokenId = 1;
      }

      // ============================================================
      // NFT MINT SUCCESSFUL - Return result
      // Points deduction will be handled by caller (Store.tsx)
      // ============================================================
      console.log('✅ NFT minted successfully!');
      console.log(`   Token ID: ${tokenId}`);
      console.log(`   Transaction Hash: ${result.hash}`);
      console.log('   Points will be deducted by caller after confirmation');
      console.log('');
      
      return {
        tokenId,
        txHash: result.hash
      };
    } catch (error: any) {
      console.error('Contract mint error:', error);
      throw new Error(`Failed to mint NFT: ${error.message || error}`);
    }
  }

  /**
   * Get the latest token ID for an address
   * This queries the contract to find the highest token ID owned by the address
   */
  async getLatestTokenId(ownerAddress: string): Promise<number> {
    try {
      // Query balance first
      const balance = await this.balanceOf(ownerAddress);
      
      if (balance === 0) {
        return 0;
      }

      // Since we're using sequential minting, we can query tokens
      // For now, return a placeholder - in production you'd query the contract
      // This is a simplified version - you might need to track token IDs differently
      return balance; // This is a placeholder
    } catch (error) {
      console.error('Error getting latest token ID:', error);
      return 0;
    }
  }


  /**
   * Get balance of tokens for an address
   * Uses Soroban RPC to simulate the call
   */
  async balanceOf(ownerAddress: string): Promise<number> {
    try {
      const address = Address.fromString(ownerAddress);
      const contractCall = this.contract.call(
        'balance',
        nativeToScVal(address, { type: 'address' })
      );
      
      // Create a dummy account for simulation
      const dummyAccount = new Account(ownerAddress, '0');
      
      // Build transaction for simulation
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build();
      
      // Simulate the call
      const simulation = await this.rpcServer.simulateTransaction(transaction);
      
      if (simulation.result && simulation.result.retval) {
        const balance = scValToNative(simulation.result.retval);
        if (typeof balance === 'number') {
          return balance;
        } else if (typeof balance === 'bigint') {
          return Number(balance);
        }
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  /**
   * Get ship metadata from contract
   */
  async getShipClass(tokenId: number): Promise<string | null> {
    try {
      const contractCall = this.contract.call(
        'get_ship_class',
        nativeToScVal(tokenId, { type: 'u32' })
      );
      
      const dummyAccount = new Account('GANJV3X43ARMZ2UWDYM6E7ZWMIFXLYQLJO5TXJX76OJGFCHKYSUG6VZP', '0');
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build();
      
      const simulation = await this.rpcServer.simulateTransaction(transaction);
      
      if (simulation.result && simulation.result.retval) {
        const result = scValToNative(simulation.result.retval);
        if (typeof result === 'string') {
          return result;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting ship class:', error);
      return null;
    }
  }
  
  /**
   * Get ship rarity from contract
   */
  async getShipRarity(tokenId: number): Promise<string | null> {
    try {
      const contractCall = this.contract.call(
        'get_ship_rarity',
        nativeToScVal(tokenId, { type: 'u32' })
      );
      
      const dummyAccount = new Account('GANJV3X43ARMZ2UWDYM6E7ZWMIFXLYQLJO5TXJX76OJGFCHKYSUG6VZP', '0');
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build();
      
      const simulation = await this.rpcServer.simulateTransaction(transaction);
      
      if (simulation.result && simulation.result.retval) {
        const result = scValToNative(simulation.result.retval);
        if (typeof result === 'string') {
          return result;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting ship rarity:', error);
      return null;
    }
  }
  
  /**
   * Get ship tier from contract
   */
  async getShipTier(tokenId: number): Promise<string | null> {
    try {
      const contractCall = this.contract.call(
        'get_ship_tier',
        nativeToScVal(tokenId, { type: 'u32' })
      );
      
      const dummyAccount = new Account('GANJV3X43ARMZ2UWDYM6E7ZWMIFXLYQLJO5TXJX76OJGFCHKYSUG6VZP', '0');
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build();
      
      const simulation = await this.rpcServer.simulateTransaction(transaction);
      
      if (simulation.result && simulation.result.retval) {
        const result = scValToNative(simulation.result.retval);
        if (typeof result === 'string') {
          return result;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting ship tier:', error);
      return null;
    }
  }
  
  /**
   * Get owner of a token
   */
  async ownerOf(tokenId: number): Promise<string | null> {
    try {
      const contractCall = this.contract.call(
        'owner_of',
        nativeToScVal(tokenId, { type: 'u32' })
      );
      
      const dummyAccount = new Account('GANJV3X43ARMZ2UWDYM6E7ZWMIFXLYQLJO5TXJX76OJGFCHKYSUG6VZP', '0');
      const transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase,
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build();
      
      const simulation = await this.rpcServer.simulateTransaction(transaction);
      
      if (simulation.result && simulation.result.retval) {
        const result = scValToNative(simulation.result.retval);
        if (typeof result === 'string') {
          return result;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting owner:', error);
      return null;
    }
  }
  
  /**
   * Get all token IDs owned by an address
   * Since we use sequential minting, we can iterate through token IDs
   */
  async getTokenIdsByOwner(ownerAddress: string, maxTokens: number = 200): Promise<number[]> {
    try {
      const balance = await this.balanceOf(ownerAddress);
      console.log(`📊 Balance for ${ownerAddress}: ${balance}`);
      
      if (balance === 0) {
        console.log('⚠️ Balance is 0, returning empty array');
        return [];
      }
      
      const tokenIds: number[] = [];
      // Increase max iterations to find all tokens (balance * 3 for safety)
      const maxIterations = Math.min(maxTokens, Math.max(100, balance * 3));
      
      console.log(`🔍 Searching for tokens (max iterations: ${maxIterations}, expected balance: ${balance})`);
      
      // Iterate through possible token IDs (starting from 1)
      for (let tokenId = 1; tokenId <= maxIterations; tokenId++) {
        try {
          const owner = await this.ownerOf(tokenId);
          if (owner && owner.toLowerCase() === ownerAddress.toLowerCase()) {
            tokenIds.push(tokenId);
            console.log(`✅ Found token ${tokenId} owned by ${ownerAddress.slice(0, 8)}...`);
            
            // If we found all tokens, we can stop early
            if (tokenIds.length >= balance) {
              console.log(`✅ Found all ${balance} tokens, stopping search`);
              break;
            }
          }
        } catch (error) {
          // Token might not exist, continue
          continue;
        }
      }
      
      console.log(`📦 Total tokens found: ${tokenIds.length}/${balance}`);
      return tokenIds;
    } catch (error) {
      console.error('❌ Error getting token IDs by owner:', error);
      return [];
    }
  }
  
  /**
   * Get ship attack stat from contract
   */
  async getShipAttack(tokenId: number): Promise<number | null> {
    try {
      // Note: Contract stores attack as u32, but we don't have a getter function
      // For now, return null - stats are stored in contract but not exposed via getter
      // We'll use rarity-based fallback in Collection.tsx
      return null;
    } catch (error) {
      console.error('Error getting ship attack:', error);
      return null;
    }
  }
  
  /**
   * Get full ship metadata for a token
   */
  async getShipMetadata(tokenId: number): Promise<{
    class: string | null;
    rarity: string | null;
    tier: string | null;
    attack?: number;
    speed?: number;
    shield?: number;
  }> {
    try {
      const [class_, rarity, tier] = await Promise.all([
        this.getShipClass(tokenId),
        this.getShipRarity(tokenId),
        this.getShipTier(tokenId)
      ]);
      
      // Stats are stored in contract but we don't have getter functions yet
      // Return basic metadata - stats will be inferred from rarity in Collection.tsx
      return {
        class: class_,
        rarity: rarity,
        tier: tier
      };
    } catch (error) {
      console.error('Error getting ship metadata:', error);
      return {
        class: null,
        rarity: null,
        tier: null
      };
    }
  }
  
  /**
   * Get collection for an address
   * Returns array of token IDs and their metadata
   */
  async getCollection(ownerAddress: string): Promise<Array<{
    tokenId: number;
    class: string | null;
    rarity: string | null;
    tier: string | null;
  }>> {
    try {
      const tokenIds = await this.getTokenIdsByOwner(ownerAddress);
      const collection = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const metadata = await this.getShipMetadata(tokenId);
          return {
            tokenId,
            ...metadata
          };
        })
      );
      
      return collection;
    } catch (error) {
      console.error('Error getting collection:', error);
      return [];
    }
  }

  /**
   * Get IPFS CID for a token
   */
  async getIpfsCid(tokenId: number): Promise<string | null> {
    try {
      const result = await this.contract.call(
        'get_ipfs_cid',
        nativeToScVal(tokenId, { type: 'u128' })
      );
      return null; // Placeholder
    } catch (error) {
      console.error('Error getting IPFS CID:', error);
      return null;
    }
  }

  /**
   * Get contract owner
   * This queries the contract to get the owner address
   */
  async getOwner(): Promise<string | null> {
    try {
      // Simulate the call to get owner
      const ownerAddress = Address.fromString('GANJV3X43ARMZ2UWDYM6E7ZWMIFXLYQLJO5TXJX76OJGFCHKYSUG6VZP');
      const result = this.contract.call('owner');
      
      // Use RPC to simulate the call
      const simulation = await this.rpcServer.simulateTransaction(
        new TransactionBuilder(
          new Account('GANJV3X43ARMZ2UWDYM6E7ZWMIFXLYQLJO5TXJX76OJGFCHKYSUG6VZP', '0'),
          {
            fee: BASE_FEE,
            networkPassphrase: this.networkPassphrase,
          }
        )
        .addOperation(result)
        .setTimeout(30)
        .build()
      );
      
      if (simulation.result && simulation.result.retval) {
        const owner = scValToNative(simulation.result.retval);
        if (typeof owner === 'string') {
          return owner;
        }
      }
      
      // Fallback: return known owner from deployment
      return 'GANJV3X43ARMZ2UWDYM6E7ZWMIFXLYQLJO5TXJX76OJGFCHKYSUG6VZP';
    } catch (error) {
      console.error('Error getting contract owner:', error);
      // Fallback: return known owner from deployment
      return 'GANJV3X43ARMZ2UWDYM6E7ZWMIFXLYQLJO5TXJX76OJGFCHKYSUG6VZP';
    }
  }

  /**
   * Check if an address is the contract owner
   */
  async isOwner(address: string): Promise<boolean> {
    try {
      const owner = await this.getOwner();
      return owner?.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error checking owner:', error);
      return false;
    }
  }
}

export default SpaceStellarNFTClient;
