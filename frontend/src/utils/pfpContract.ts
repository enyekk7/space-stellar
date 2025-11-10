/**
 * PFP NFT Contract Client for Frontend
 * Handles building and signing transactions for PFP NFT minting
 */

import { 
  Contract, 
  Address, 
  nativeToScVal, 
  scValToNative, 
  Networks,
  TransactionBuilder,
  BASE_FEE,
  Account,
  SorobanRpc
} from '@stellar/stellar-sdk'
import { CONTRACT_ID, NETWORK, SOROBAN_RPC_URL } from '../contracts/config'

export class PFPMintClient {
  private contract: Contract
  private rpcServer: SorobanRpc.Server
  private networkPassphrase: string

  constructor(
    contractId: string,
    network: 'testnet' | 'mainnet' = NETWORK,
    rpcUrl: string = SOROBAN_RPC_URL
  ) {
    if (!contractId) {
      throw new Error('Contract ID is required')
    }

    // Trim contract ID to remove any whitespace
    const trimmedContractId = contractId.trim()
    
    console.log('🔍 Validating contract ID:', {
      original: contractId,
      trimmed: trimmedContractId,
      length: trimmedContractId?.length,
      startsWithC: trimmedContractId?.startsWith('C'),
      type: typeof trimmedContractId
    })
    
    // Validate contract ID format (Stellar contract IDs are 56 characters and start with 'C')
    if (!trimmedContractId) {
      throw new Error('Contract ID is empty after trimming')
    }
    
    if (trimmedContractId.length !== 56) {
      console.error('Invalid contract ID length:', {
        contractId: trimmedContractId,
        length: trimmedContractId.length,
        expected: 56
      })
      throw new Error(`Invalid contract ID length: "${trimmedContractId}". Expected 56 characters, got ${trimmedContractId.length}`)
    }
    
    if (!trimmedContractId.startsWith('C')) {
      console.error('Invalid contract ID prefix:', {
        contractId: trimmedContractId,
        firstChar: trimmedContractId[0]
      })
      throw new Error(`Invalid contract ID prefix: "${trimmedContractId}". Expected to start with 'C', got '${trimmedContractId[0]}'`)
    }

    try {
      console.log('📝 Creating Contract instance with ID:', trimmedContractId)
      this.contract = new Contract(trimmedContractId)
      console.log('✅ Contract instance created successfully')
    } catch (error: any) {
      console.error('❌ Error creating Contract instance:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        contractId: trimmedContractId
      })
      throw new Error(`Failed to create Contract instance: ${error.message || error}. Contract ID: ${trimmedContractId}`)
    }

    this.networkPassphrase = network === 'mainnet' ? Networks.PUBLIC : Networks.TESTNET
    
    this.rpcServer = new SorobanRpc.Server(rpcUrl, {
      allowHttp: network === 'testnet' || rpcUrl.includes('localhost')
    })
  }

  /**
   * Build mint transaction XDR for user to sign
   * @param toAddress - Address to mint to
   * @param sourceAccount - Source account (user's address)
   * @returns Promise<string> - Transaction XDR
   */
  async buildMintTransaction(toAddress: string, sourceAccount: string): Promise<string> {
    try {
      // Validate address
      if (!toAddress.startsWith('G') || toAddress.length !== 56) {
        throw new Error(`Invalid address format: ${toAddress}`)
      }

      const toAddressObj = Address.fromString(toAddress)
      const toAddressScVal = nativeToScVal(toAddressObj)
      const contractCall = this.contract.call('mint', toAddressScVal)

      // Load source account
      const accountResponse = await this.rpcServer.getAccount(sourceAccount)
      const account = new Account(sourceAccount, accountResponse.sequenceNumber())

      // Build transaction
      let transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build()

      // Prepare transaction (REQUIRED for Soroban)
      transaction = await this.rpcServer.prepareTransaction(transaction)

      return transaction.toXDR()
    } catch (error: any) {
      console.error('Error building mint transaction:', error)
      throw new Error(`Failed to build transaction: ${error.message || error}`)
    }
  }

  /**
   * Submit signed transaction
   * @param signedXdr - Signed transaction XDR
   * @returns Promise<{tokenId: number, txHash: string}>
   */
  async submitTransaction(signedXdr: string): Promise<{tokenId: number, txHash: string}> {
    try {
      // Parse signed transaction
      const transaction = TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase)

      console.log('📤 Submitting transaction to Soroban RPC...')
      // Send transaction
      const sendResponse = await this.rpcServer.sendTransaction(transaction)
      
      console.log('📡 Transaction sent:', {
        status: sendResponse.status,
        hash: sendResponse.hash
      })
      
      const status = sendResponse.status as string
      if (status === 'SUCCESS' || status === 'PENDING') {
        console.log('✅ Transaction sent successfully!')
        console.log('   Hash:', sendResponse.hash)
        console.log('   Status:', status)
        
        // If status is SUCCESS, try to get token ID quickly
        if (status === 'SUCCESS') {
          console.log('✅ Transaction already confirmed!')
          
          // Try to get transaction details (with short timeout)
          let tokenId = 0
          try {
            // Wait a bit for transaction to be indexed
            await new Promise(resolve => setTimeout(resolve, 2000))
            const txResult = await this.rpcServer.getTransaction(sendResponse.hash)
            if (txResult && txResult.status === 'SUCCESS' && 'returnValue' in txResult) {
              tokenId = scValToNative(txResult.returnValue) || 0
              console.log('✅ Got token ID:', tokenId)
            }
          } catch (e) {
            console.warn('⚠️ Could not get token ID immediately, but transaction was successful')
            console.warn('   Token ID will be 0, but transaction hash is saved')
          }
          
          return {
            tokenId,
            txHash: sendResponse.hash
          }
        }
        
        // If PENDING, try to check status quickly (max 5 seconds)
        // If not found quickly, just return hash - transaction is processing
        console.log('⏳ Transaction pending, checking status quickly...')
        let tokenId = 0
        let attempts = 0
        const maxQuickAttempts = 5 // Only check 5 times (5 seconds)
        
        while (attempts < maxQuickAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          try {
            const txResult = await this.rpcServer.getTransaction(sendResponse.hash)
            
            if (txResult.status === 'SUCCESS') {
              console.log('✅ Transaction confirmed quickly!')
              if ('returnValue' in txResult && txResult.returnValue) {
                tokenId = scValToNative(txResult.returnValue) || 0
              }
              break
            }
            
            // If transaction failed, throw error
            if (txResult.status === 'FAILED') {
              const errorMsg = ('errorResult' in txResult && txResult.errorResult) 
                ? String(txResult.errorResult) 
                : 'Unknown error'
              throw new Error(`Transaction failed: ${errorMsg}`)
            }
            
            // If still pending, continue
            console.log(`⏳ Still pending (attempt ${attempts + 1}/${maxQuickAttempts})...`)
          } catch (e: any) {
            // If transaction not found, it's still processing
            // Don't log as error, just continue
            if (e.message && e.message.includes('not found')) {
              console.log(`⏳ Transaction not indexed yet (attempt ${attempts + 1}/${maxQuickAttempts})...`)
            } else if (e.message && !e.message.includes('Bad union switch')) {
              // Log other errors except "Bad union switch" which is a known RPC issue
              console.warn('⚠️ Error checking transaction:', e.message)
            }
          }
          
          attempts++
        }

        // Return immediately - transaction is processing
        // Token ID will be 0, but hash is saved for verification
        console.log('✅ Transaction sent! Hash saved for verification.')
        console.log('   Transaction is processing on-chain.')
        console.log('   Token ID will be available once transaction confirms.')
        
        return {
          tokenId, // May be 0 if not confirmed yet
          txHash: sendResponse.hash
        }
      } else {
        const errorMsg = ('errorResult' in sendResponse && sendResponse.errorResult)
          ? String(sendResponse.errorResult)
          : 'Unknown error'
        throw new Error(`Transaction failed: ${errorMsg}`)
      }
    } catch (error: any) {
      console.error('❌ Error submitting transaction:', error)
      throw error
    }
  }

  /**
   * Check if address has PFP using contract's has_pfp function
   */
  async hasPFP(address: string): Promise<boolean> {
    try {
      const addressObj = Address.fromString(address)
      const addressScVal = nativeToScVal(addressObj)
      
      // Use contract's has_pfp function
      const contractCall = this.contract.call('has_pfp', addressScVal)

      // Use the actual address instead of dummy account
      // Load account from RPC to get valid sequence number
      let account: Account
      try {
        const accountResponse = await this.rpcServer.getAccount(address)
        account = new Account(address, accountResponse.sequenceNumber())
      } catch (e) {
        // If account doesn't exist, use sequence 0
        account = new Account(address, '0')
      }

      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build()

      const simulateResult = await this.rpcServer.simulateTransaction(transaction)

      if (simulateResult && 'result' in simulateResult && simulateResult.result && 'retval' in simulateResult.result) {
        const result = scValToNative(simulateResult.result.retval)
        return result === true || result === 1 || (typeof result === 'bigint' && result > 0n)
      }

      return false
    } catch (error) {
      console.error('Error checking PFP:', error)
      // Return false on error to allow mint attempt
      return false
    }
  }
}

