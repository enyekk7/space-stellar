import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletKit } from '../contexts/WalletContext'
import EditProfileModal from '../components/EditProfileModal'
import axios from 'axios'
import './Profile.css'

interface UserProfile {
  id?: number // Sequential numeric ID (243681, 243682, ...)
  userId: string // Text user_id (USER-243681, ...)
  address: string
  username: string
  avatarUrl?: string
  defaultShipTokenId?: number
  createdAt: string
  xp?: number // Experience points
  level?: number // Player level
  stats: {
    totalMatches: number
    wins: number
    bestScore: number
    shipsOwned: number
  }
}

const Profile = () => {
  const navigate = useNavigate()
  const { address } = useWalletKit()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')

  useEffect(() => {
    if (address) {
      loadProfile()
    }
  }, [address])

  const loadProfile = async () => {
    if (!address) return

    setLoading(true)
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/profile/${address}`
      )
      // Load XP from localStorage if not in backend
      const storedXP = localStorage.getItem(`xp_${address}`)
      const xp = storedXP ? parseInt(storedXP, 10) : (response.data.user?.xp || 0)
      const level = calculateLevel(xp)

      const userData = response.data.user || {
        address,
        userId: response.data.userId || generateUserId(),
        username: '',
        xp: xp,
        level: level,
        stats: {
          totalMatches: 0,
          wins: 0,
          bestScore: 0,
          shipsOwned: 0
        }
      }
      
      // Ensure XP and level are set
      if (!userData.xp) userData.xp = xp
      if (!userData.level) userData.level = level
      
      setProfile(userData)
      setUsername(userData.username || '')
    } catch (error) {
      console.error('Error loading profile:', error)
      // Create new user if doesn't exist
      if (!profile) {
        const storedXP = localStorage.getItem(`xp_${address}`)
        const xp = storedXP ? parseInt(storedXP, 10) : 0
        const level = calculateLevel(xp)
        
        const newProfile: UserProfile = {
          userId: generateUserId(),
          address: address!,
          username: '',
          createdAt: new Date().toISOString(),
          xp: xp,
          level: level,
          stats: {
            totalMatches: 0,
            wins: 0,
            bestScore: 0,
            shipsOwned: 0
          }
        }
        setProfile(newProfile)
      }
    } finally {
      setLoading(false)
    }
  }

  const generateUserId = () => {
    return `USER-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
  }

  // Calculate level from XP
  const calculateLevel = (xp: number): number => {
    // Level formula: level = floor(sqrt(xp / 100)) + 1
    // Each level requires more XP: 100, 400, 900, 1600, 2500, etc.
    return Math.floor(Math.sqrt(xp / 100)) + 1
  }

  // Calculate XP needed for next level
  const getXPForNextLevel = (currentLevel: number): number => {
    // XP needed for level N = 100 * N^2
    return 100 * currentLevel * currentLevel
  }

  // Calculate XP needed for current level
  const getXPForCurrentLevel = (currentLevel: number): number => {
    if (currentLevel <= 1) return 0
    return 100 * (currentLevel - 1) * (currentLevel - 1)
  }

  // Get XP progress for current level
  const getXPProgress = (xp: number, level: number): { current: number; needed: number; percentage: number } => {
    const xpForCurrent = getXPForCurrentLevel(level)
    const xpForNext = getXPForNextLevel(level)
    const currentXP = xp - xpForCurrent
    const neededXP = xpForNext - xpForCurrent
    const percentage = Math.min(100, Math.max(0, (currentXP / neededXP) * 100))
    
    return {
      current: currentXP,
      needed: neededXP,
      percentage
    }
  }

  const handleSaveProfile = async () => {
    if (!address || !profile) return

    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/users/profile/${address}`,
        {
          username,
          userId: profile.userId
        }
      )
      setProfile({ ...profile, username })
      setEditing(false)
      alert('Profile updated!')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile')
    }
  }

  if (!address) {
    return (
      <div className="profile">
        <div className="profile-empty">
          <h2>CONNECT WALLET</h2>
          <p>Please connect your Stellar wallet to view your profile</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="profile">
        <div className="loading-container">
          <p className="loading">LOADING PROFILE...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile">
        <div className="profile-empty">
          <p>ERROR LOADING PROFILE</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile">
      <h1 className="page-title">PROFILE</h1>

      <div className="profile-container">
        <div className="profile-header card">
          <div className="profile-avatar">
            {(() => {
              // Check for NFT PFP first
              if (address) {
                const pfpKey = `pfp_nft_${address}`
                const storedPFP = localStorage.getItem(pfpKey)
                if (storedPFP) {
                  const pfpData = JSON.parse(storedPFP)
                  return <img src={pfpData.image} alt="NFT PFP" />
                }
              }
              
              // Fallback to avatarUrl or placeholder
              if (profile.avatarUrl) {
                return <img src={profile.avatarUrl} alt="Avatar" />
              }
              
              return (
                <div className="avatar-placeholder">
                  {profile.username?.[0]?.toUpperCase() || '?'}
                </div>
              )
            })()}
          </div>
          <div className="profile-info">
            <div className="profile-user-id">
              {profile.id ? (
                <>
                  <span style={{ fontWeight: 'bold', color: '#00ff41' }}>ID: {profile.id}</span>
                  <span style={{ fontSize: '0.8em', color: '#888', marginLeft: '10px' }}>
                    ({profile.userId})
                  </span>
                </>
              ) : (
                <>ID: {profile.userId}</>
              )}
            </div>
            <h2 className="profile-username">
              {profile.username || 'ANONYMOUS PLAYER'}
            </h2>
            <button
              className="btn btn-small"
              onClick={() => setEditing(true)}
            >
              EDIT PROFILE
            </button>
            
            <EditProfileModal
              isOpen={editing}
              onClose={() => setEditing(false)}
              username={username}
              onUsernameChange={setUsername}
              onSave={handleSaveProfile}
              onCancel={() => {
                setUsername(profile.username || '')
                setEditing(false)
              }}
            />
            <div className="profile-address">
              {address.slice(0, 12)}...{address.slice(-8)}
            </div>
          </div>
        </div>

        {/* XP & Level Section */}
        <div className="profile-xp card">
          <h3 className="xp-title">LEVEL & EXPERIENCE</h3>
          <div className="xp-container">
            <div className="xp-header">
              <div className="level-display">
                <span className="level-label">LEVEL</span>
                <span className="level-value">{profile.level || calculateLevel(profile.xp || 0)}</span>
              </div>
              <div className="xp-text">
                <span className="xp-current">{profile.xp || 0}</span>
                <span className="xp-separator">/</span>
                <span className="xp-total">{getXPForNextLevel(profile.level || calculateLevel(profile.xp || 0))}</span>
                <span className="xp-label">XP</span>
              </div>
            </div>
            <div className="xp-progress-bar">
              <div 
                className="xp-progress-fill" 
                style={{ 
                  width: `${getXPProgress(profile.xp || 0, profile.level || calculateLevel(profile.xp || 0)).percentage}%` 
                }}
              ></div>
            </div>
            <div className="xp-progress-text">
              {getXPProgress(profile.xp || 0, profile.level || calculateLevel(profile.xp || 0)).current} / {getXPProgress(profile.xp || 0, profile.level || calculateLevel(profile.xp || 0)).needed} XP to next level
            </div>
          </div>
        </div>

        <div className="profile-stats card">
          <h3 className="stats-title">STATISTICS</h3>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">{profile.stats.totalMatches}</div>
              <div className="stat-label">MATCHES</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{profile.stats.wins}</div>
              <div className="stat-label">WINS</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{profile.stats.bestScore}</div>
              <div className="stat-label">BEST SCORE</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{profile.stats.shipsOwned}</div>
              <div className="stat-label">SHIPS OWNED</div>
            </div>
          </div>
        </div>

        <div className="profile-actions card">
          <h3 className="actions-title">ACTIONS</h3>
          <div className="actions-grid">
            <button 
              className="btn action-btn"
              onClick={() => navigate('/leaderboard')}
            >
              VIEW LEADERBOARD
            </button>
            <button 
              className="btn action-btn"
              onClick={() => navigate('/history')}
            >
              MATCH HISTORY
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile


