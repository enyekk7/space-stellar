// Helper function to complete all missions for testing
// Usage: Call completeAllMissionsForTest(address) in browser console

import { getMatchStats, updateMatchStats, claimMission } from './missionTracker'

export const completeAllMissionsForTest = (address: string) => {
  if (!address) {
    console.error('❌ Address is required')
    return
  }

  console.log('🧪 TEST MODE: Completing all missions for address:', address)

  // Set match stats to complete all missions
  const statsKey = `match_stats_${address}`
  const testStats = {
    totalMatches: 100, // Complete "Veteran Player" (50 matches)
    totalWins: 25, // Complete "Weekly Quest" (20 wins)
    multiplayerMatches: 25, // Complete "Multiplayer Master" (20 matches)
    todayMatches: 15, // Complete "Daily Challenge" (10 matches)
    weekMatches: 25,
    totalCoins: 0,
    lastUpdate: new Date().toISOString(),
    lastWeekStart: new Date().toDateString()
  }

  localStorage.setItem(statsKey, JSON.stringify(testStats))
  console.log('✅ Match stats updated:', testStats)

  // Clear claimed missions so user can claim again
  const claimsKey = `missions_claimed_${address}`
  localStorage.removeItem(claimsKey)
  console.log('✅ Cleared claimed missions (can claim again)')

  console.log('🎉 All missions are now completed!')
  console.log('   - Daily Challenge: 15/10 ✅')
  console.log('   - Weekly Quest: 25/20 ✅')
  console.log('   - Multiplayer Master: 25/20 ✅')
  console.log('   - Veteran Player: 100/50 ✅')
  console.log('')
  console.log('💡 Refresh the Missions page to see completed missions!')
}

// Helper to find address by user ID (if stored in localStorage or backend)
export const findAddressByUserId = async (userId: number): Promise<string | null> => {
  // Try to find in localStorage first
  const keys = Object.keys(localStorage)
  for (const key of keys) {
    if (key.startsWith('match_stats_')) {
      const address = key.replace('match_stats_', '')
      // Check if this address has the user ID
      // This is a simple approach - in real app, you'd query backend
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/users/profile/${address}`)
        const data = await response.json()
        if (data.user?.id === userId) {
          return address
        }
      } catch (e) {
        // Skip if can't check
      }
    }
  }
  return null
}

// Complete missions for user ID
export const completeMissionsForUserId = async (userId: number) => {
  const address = await findAddressByUserId(userId)
  if (!address) {
    console.error(`❌ Could not find address for user ID: ${userId}`)
    console.log('💡 Please provide wallet address directly')
    return
  }
  console.log(`✅ Found address for user ID ${userId}: ${address}`)
  completeAllMissionsForTest(address)
}



