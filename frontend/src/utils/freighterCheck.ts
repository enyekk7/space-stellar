// Utility to check if Freighter is available
import { isConnected, getPublicKey } from '@stellar/freighter-api'

export const checkFreighterAvailable = async (): Promise<{
  available: boolean
  connected: boolean
  publicKey: string | null
  error?: string
}> => {
  try {
    // Try to check connection status
    const connected = await isConnected()
    
    if (connected) {
      try {
        const pubKey = await getPublicKey()
        return {
          available: true,
          connected: true,
          publicKey: pubKey,
        }
      } catch (e: any) {
        return {
          available: true,
          connected: false,
          publicKey: null,
          error: e.message,
        }
      }
    }
    
    return {
      available: true,
      connected: false,
      publicKey: null,
    }
  } catch (error: any) {
    const errorMsg = error.message || error.toString() || 'Unknown error'
    
    // Check if it's a "not installed" error
    if (
      errorMsg.includes('not installed') ||
      errorMsg.includes('Freighter') ||
      errorMsg.includes('Extension')
    ) {
      return {
        available: false,
        connected: false,
        publicKey: null,
        error: 'Freighter wallet tidak terdeteksi. Pastikan extension sudah terinstall dan aktif.',
      }
    }
    
    // Other errors might mean Freighter is there but something else is wrong
    return {
      available: true,
      connected: false,
      publicKey: null,
      error: errorMsg,
    }
  }
}

// Wait for Freighter to be available (with timeout)
export const waitForFreighter = async (timeout: number = 5000): Promise<boolean> => {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    const check = await checkFreighterAvailable()
    if (check.available) {
      return true
    }
    await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms before retry
  }
  
  return false
}







