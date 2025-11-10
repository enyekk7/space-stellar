import { useState, useEffect } from 'react'
import { useWalletKit } from '../contexts/WalletContext'
import { useNavigate } from 'react-router-dom'
import { initializeMissions, claimMission, type Mission } from '../utils/missionTracker'
import { completeMissionsForUserId } from '../utils/testMissionHelper'
import ClaimRewardModal from '../components/ClaimRewardModal'
import './Missions.css'

const Missions = () => {
  const { isConnected, address } = useWalletKit()
  const navigate = useNavigate()
  const [missions, setMissions] = useState<Mission[]>([])
  const [claimModal, setClaimModal] = useState<{ isOpen: boolean; mission: Mission | null }>({
    isOpen: false,
    mission: null
  })

  useEffect(() => {
    if (address) {
      const loadedMissions = initializeMissions(address)
      setMissions(loadedMissions)
      
      // Expose function to window for manual testing
      ;(window as any).completeAllMissions = () => {
        const statsKey = `match_stats_${address}`
        const testStats = {
          totalMatches: 100,
          totalWins: 25,
          multiplayerMatches: 25,
          todayMatches: 15,
          weekMatches: 25,
          totalCoins: 0,
          lastUpdate: new Date().toISOString(),
          lastWeekStart: new Date().toDateString()
        }
        localStorage.setItem(statsKey, JSON.stringify(testStats))
        
        const claimsKey = `missions_claimed_${address}`
        localStorage.removeItem(claimsKey)
        
        const loadedMissions = initializeMissions(address)
        setMissions(loadedMissions)
        
        console.log('✅ All missions completed!')
        return 'All missions completed!'
      }
    }
  }, [address])

  // TEST HELPER: Complete all missions for user ID 245156
  useEffect(() => {
    if (!address) return
    
    // Check user ID from profile
    const checkAndCompleteMissions = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        const response = await fetch(`${apiUrl}/api/users/profile/${address}`)
        const data = await response.json()
        
        // If user ID is 245156, complete all missions
        if (data.user?.id === 245156 || data.id === 245156) {
          console.log('🧪 TEST MODE: User ID 245156 detected - Completing all missions')
          
          // Directly set stats for this address
          const statsKey = `match_stats_${address}`
          const testStats = {
            totalMatches: 100,
            totalWins: 25,
            multiplayerMatches: 25,
            todayMatches: 15,
            weekMatches: 25,
            totalCoins: 0,
            lastUpdate: new Date().toISOString(),
            lastWeekStart: new Date().toDateString()
          }
          localStorage.setItem(statsKey, JSON.stringify(testStats))
          
          // Clear claimed missions so user can claim again
          const claimsKey = `missions_claimed_${address}`
          localStorage.removeItem(claimsKey)
          
          // Reload missions
          const loadedMissions = initializeMissions(address)
          setMissions(loadedMissions)
          
          console.log('✅ All missions completed for testing!')
          console.log('   - Daily Challenge: 15/10 ✅')
          console.log('   - Weekly Quest: 25/20 ✅')
          console.log('   - Multiplayer Master: 25/20 ✅')
          console.log('   - Veteran Player: 100/50 ✅')
        }
      } catch (error) {
        // If can't check, try URL parameter as fallback
        const urlParams = new URLSearchParams(window.location.search)
        const testUserId = urlParams.get('test')
        
        if (testUserId === '245156') {
          console.log('🧪 TEST MODE: URL parameter detected - Completing all missions')
          
          const statsKey = `match_stats_${address}`
          const testStats = {
            totalMatches: 100,
            totalWins: 25,
            multiplayerMatches: 25,
            todayMatches: 15,
            weekMatches: 25,
            totalCoins: 0,
            lastUpdate: new Date().toISOString(),
            lastWeekStart: new Date().toDateString()
          }
          localStorage.setItem(statsKey, JSON.stringify(testStats))
          
          const claimsKey = `missions_claimed_${address}`
          localStorage.removeItem(claimsKey)
          
          const loadedMissions = initializeMissions(address)
          setMissions(loadedMissions)
          
          console.log('✅ All missions completed for testing!')
        }
      }
    }
    
    checkAndCompleteMissions()
  }, [address])

  const handleClaim = async (mission: Mission) => {
    if (address && mission.completed && !mission.claimed) {
      // Add reward to player account
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
        
        if (mission.reward.type === 'points') {
          // Add points
          const response = await fetch(`${apiUrl}/api/points/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: address,
              amount: mission.reward.amount,
              reason: `Mission Reward: ${mission.title}`
            })
          })
          
          const result = await response.json()
          
          if (result.success) {
            console.log(`✅ Added ${mission.reward.amount} points from mission reward`)
            console.log(`   New points balance: ${result.points}`)
          } else {
            console.warn('⚠️ Failed to add points from mission:', result)
          }
        } else if (mission.reward.type === 'coins') {
          // Add coins (also added as points in this system)
          const response = await fetch(`${apiUrl}/api/points/add`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: address,
              amount: mission.reward.amount,
              reason: `Mission Reward: ${mission.title}`
            })
          })
          
          const result = await response.json()
          
          if (result.success) {
            console.log(`✅ Added ${mission.reward.amount} coins (as points) from mission reward`)
            console.log(`   New points balance: ${result.points}`)
          } else {
            console.warn('⚠️ Failed to add coins from mission:', result)
          }
        }
      } catch (error: any) {
        console.error('❌ Error adding reward to account:', error)
        // Still mark as claimed even if API fails (user can contact admin)
      }
      
      // Mark mission as claimed
      claimMission(address, mission.id)
      setClaimModal({ isOpen: true, mission })
      
      // Update mission in state
      setMissions(prev => prev.map(m => 
        m.id === mission.id ? { ...m, claimed: true } : m
      ))
    }
  }

  const handleCloseClaimModal = () => {
    setClaimModal({ isOpen: false, mission: null })
    // Reload missions to update progress
    if (address) {
      const loadedMissions = initializeMissions(address)
      setMissions(loadedMissions)
    }
  }

  if (!isConnected) {
    return (
      <div className="missions-page">
        <div className="missions-container">
          <h1>MISSIONS</h1>
          <p>Please connect your wallet to view missions.</p>
          <button onClick={() => navigate('/')} className="btn-back">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="missions-page">
      <div className="missions-container">
        <div className="missions-header">
          <button onClick={() => navigate('/')} className="btn-back">
            ← Back
          </button>
          <h1>📋 MISSIONS</h1>
        </div>

        <div className="missions-content">
          {missions.map((mission) => {
            const progress = Math.min(100, (mission.current / mission.target) * 100)
            const canClaim = mission.completed && !mission.claimed

            return (
              <div key={mission.id} className={`mission-card ${mission.claimed ? 'claimed' : ''}`}>
                <div className="mission-card-header">
                  <h2>{mission.title}</h2>
                  <span className={`mission-type ${mission.type}`}>{mission.type.toUpperCase()}</span>
                </div>
                <div className="mission-card-body">
                  <p className="mission-description">{mission.description}</p>
                  <div className="mission-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {mission.current}/{mission.target} ({Math.round(progress)}%)
                    </span>
                  </div>
                  <div className="mission-reward">
                    <span className="reward-label">Reward:</span>
                    <span className="reward-value">
                      {mission.reward.amount} {mission.reward.type === 'points' ? 'Points' : 'Coins'}
                    </span>
                  </div>
                  {canClaim && (
                    <button 
                      className="claim-mission-btn"
                      onClick={() => handleClaim(mission)}
                    >
                      CLAIM REWARD
                    </button>
                  )}
                  {mission.claimed && (
                    <div className="mission-claimed">
                      ✓ CLAIMED
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {claimModal.mission && (
          <ClaimRewardModal
            isOpen={claimModal.isOpen}
            onClose={handleCloseClaimModal}
            reward={claimModal.mission.reward}
            missionTitle={claimModal.mission.title}
          />
        )}
      </div>
    </div>
  )
}

export default Missions

