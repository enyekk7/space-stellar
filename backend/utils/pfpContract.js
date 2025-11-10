/**
 * PFP NFT Contract Client for Backend
 * Calls Stellar Soroban smart contract to mint PFP NFTs
 */

import { 
  Contract, 
  Address, 
  nativeToScVal, 
  scValToNative, 
  Networks,
  Keypair,
  TransactionBuilder,
  BASE_FEE,
  Account
} from '@stellar/stellar-sdk'
import { SorobanRpc } from '@stellar/stellar-sdk'

export class PFPContractClient {
  constructor(contractId, network = 'testnet', rpcUrl = null) {
    if (!contractId) {
      throw new Error('Contract ID is required')
    }

    this.contractId = contractId
    this.network = network
    this.contract = new Contract(contractId)
    
    // Set RPC URL based on network
    if (!rpcUrl) {
      rpcUrl = network === 'mainnet'
        ? 'https://soroban-rpc.mainnet.stellar.org'
        : 'https://soroban-rpc.testnet.stellar.org'
    }
    
    this.rpcServer = new SorobanRpc.Server(rpcUrl, {
      allowHttp: network === 'testnet' || rpcUrl.includes('localhost')
    })
    
    this.networkPassphrase = network === 'mainnet'
      ? Networks.PUBLIC
      : Networks.TESTNET
  }

  /**
   * Check if address already has a PFP
   * @param {string} address - Stellar address
   * @returns {Promise<boolean>}
   */
  async hasPFP(address) {
    try {
      if (!address || typeof address !== 'string') {
        throw new Error('Invalid address format')
      }
      
      // Validate address format (should start with G and be 56 chars)
      if (!address.startsWith('G') || address.length !== 56) {
        throw new Error(`Invalid Stellar address format: ${address}`)
      }
      
      const addressObj = Address.fromString(address)
      const addressScVal = nativeToScVal(addressObj)
      
      // Build a read-only call
      const contractCall = this.contract.call('has_pfp', addressScVal)
      
      // Create a dummy account for simulation (read-only doesn't need real account)
      const dummyKeypair = Keypair.random()
      const dummyAccount = new Account(dummyKeypair.publicKey(), '0')
      
      // Build transaction for simulation
      let transaction = new TransactionBuilder(dummyAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build()
      
      // Simulate transaction (read-only, no actual transaction sent)
      const simulateResult = await this.rpcServer.simulateTransaction(transaction)
      
      if (simulateResult && simulateResult.result && simulateResult.result.retval) {
        return scValToNative(simulateResult.result.retval) || false
      }
      
      return false
    } catch (error) {
      console.error('Error checking PFP:', error)
      // Return false on error (safer for read operations)
      return false
    }
  }

  /**
   * Mint PFP NFT (anyone can call - public mint)
   * @param {string} signerSecret - Signer's secret key (user who wants to mint)
   * @param {string} toAddress - Recipient address (usually same as signer)
   * @returns {Promise<{tokenId: number, txHash: string}>}
   */
  async mint(signerSecret, toAddress) {
    try {
      // Check if address already has PFP
      const hasPFP = await this.hasPFP(toAddress)
      if (hasPFP) {
        throw new Error('Address already owns a PFP NFT')
      }

      // Validate and create mint call
      if (!toAddress || typeof toAddress !== 'string') {
        throw new Error('Invalid recipient address format')
      }
      
      if (!signerSecret || typeof signerSecret !== 'string') {
        throw new Error('Invalid signer secret key format')
      }
      
      // Validate address format
      if (!toAddress.startsWith('G') || toAddress.length !== 56) {
        throw new Error(`Invalid Stellar address format: ${toAddress}`)
      }
      
      // Validate secret key format (more lenient)
      try {
        Keypair.fromSecret(signerSecret)
      } catch (e) {
        throw new Error(`Invalid Stellar secret key format: ${e.message || 'Invalid key'}`)
      }
      
      const toAddressObj = Address.fromString(toAddress)
      const toAddressScVal = nativeToScVal(toAddressObj)
      const contractCall = this.contract.call('mint', toAddressScVal)

      // Load signer account (user who wants to mint)
      const signerKeypair = Keypair.fromSecret(signerSecret)
      const signerPublicKey = signerKeypair.publicKey()
      
      // Get account from RPC server
      const signerAccountResponse = await this.rpcServer.getAccount(signerPublicKey)
      const signerAccount = new Account(signerPublicKey, signerAccountResponse.sequenceNumber())

      // Build transaction
      let transaction = new TransactionBuilder(signerAccount, {
        fee: BASE_FEE,
        networkPassphrase: this.networkPassphrase
      })
        .addOperation(contractCall)
        .setTimeout(30)
        .build()

      // Prepare transaction (REQUIRED for Soroban contracts)
      transaction = await this.rpcServer.prepareTransaction(transaction)

      // Sign transaction
      transaction.sign(signerKeypair)

      // Send transaction
      const sendResponse = await this.rpcServer.sendTransaction(transaction)
      
      if (sendResponse.status === 'SUCCESS' || sendResponse.status === 'PENDING') {
        // Wait for transaction to be confirmed
        let txResult = null
        let attempts = 0
        const maxAttempts = 30
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
          
          try {
            txResult = await this.rpcServer.getTransaction(sendResponse.hash)
            if (txResult.status === 'SUCCESS') {
              break
            }
          } catch (e) {
            // Transaction not found yet, continue waiting
          }
          
          attempts++
        }

        if (!txResult || txResult.status !== 'SUCCESS') {
          throw new Error('Transaction not confirmed within timeout')
        }

        // Get token ID from result
        let tokenId = null
        if (txResult.returnValue) {
          tokenId = scValToNative(txResult.returnValue)
        }

        return {
          tokenId: tokenId || 0,
          txHash: sendResponse.hash,
          status: 'SUCCESS'
        }
      } else {
        throw new Error(`Transaction failed: ${sendResponse.errorResult || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error minting PFP NFT:', error)
      throw error
    }
  }

  /**
   * Submit signed transaction (for frontend-signed transactions)
   * @param {string} signedXdr - Signed transaction XDR
   * @returns {Promise<{tokenId: number, txHash: string}>}
   */
  async submitTransaction(signedXdr) {
    try {
      if (!signedXdr || typeof signedXdr !== 'string') {
        throw new Error('Invalid signed XDR')
      }

      // Parse signed transaction
      const transaction = TransactionBuilder.fromXDR(signedXdr, this.networkPassphrase)

      // Send transaction
      const sendResponse = await this.rpcServer.sendTransaction(transaction)
      
      if (sendResponse.status === 'SUCCESS' || sendResponse.status === 'PENDING') {
        // Wait for confirmation
        let txResult = null
        let attempts = 0
        const maxAttempts = 30
        
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          try {
            txResult = await this.rpcServer.getTransaction(sendResponse.hash)
            if (txResult.status === 'SUCCESS') {
              break
            }
          } catch (e) {
            // Continue waiting
          }
          
          attempts++
        }

        if (!txResult || txResult.status !== 'SUCCESS') {
          throw new Error('Transaction not confirmed within timeout')
        }

        // Get token ID from result
        let tokenId = 0
        if (txResult.returnValue) {
          tokenId = scValToNative(txResult.returnValue) || 0
        }

        return {
          tokenId,
          txHash: sendResponse.hash,
          status: 'SUCCESS'
        }
      } else {
        throw new Error(`Transaction failed: ${sendResponse.errorResult || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error submitting transaction:', error)
      throw error
    }
  }
}
