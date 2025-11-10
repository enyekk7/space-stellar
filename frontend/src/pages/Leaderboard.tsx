import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Leaderboard.css'

interface LeaderboardEntry {
  address: string
  username: string | null
  best_score: number
  updated_at: string
}

const Leaderboard = () => {
  const navigate = useNavigate()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/matches/leaderboard?limit=100`
      )
      
      if (response.data && response.data.success) {
        setLeaderboard(response.data.leaderboard || [])
        console.log('✅ Leaderboard loaded:', response.data.leaderboard?.length || 0, 'players')
      } else {
        console.warn('⚠️ Leaderboard response not successful:', response.data)
        setLeaderboard([])
      }
    } catch (error: any) {
      console.error('❌ Error loading leaderboard:', error.message)
      // If backend is not available, show empty state
      if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        console.warn('⚠️ Backend not available, showing empty leaderboard')
        setLeaderboard([])
      }
    } finally {
      setLoading(false)
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#ffd700' // Gold
    if (rank === 2) return '#c0c0c0' // Silver
    if (rank === 3) return '#cd7f32' // Bronze
    return '#ffffff'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h1 className="page-title">🏆 LEADERBOARD</h1>
        <button className="btn btn-back" onClick={() => navigate('/')}>
          BACK TO HOME
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p className="loading">LOADING LEADERBOARD...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state">
          <p>No players yet</p>
          <p className="empty-hint">
            {loading 
              ? 'Loading leaderboard...' 
              : 'Be the first to play and set a score! Make sure backend server is running.'}
          </p>
          {!loading && (
            <button className="btn btn-refresh" onClick={loadLeaderboard} style={{ marginTop: '20px' }}>
              🔄 RETRY
            </button>
          )}
        </div>
      ) : (
        <div className="leaderboard-container">
          <div className="leaderboard-table">
            <div className="leaderboard-header-row">
              <div className="col-rank">RANK</div>
              <div className="col-player">PLAYER</div>
              <div className="col-score">BEST SCORE</div>
              <div className="col-updated">LAST UPDATED</div>
            </div>
            {leaderboard.map((entry, index) => {
              const rank = index + 1
              return (
                <div key={entry.address} className="leaderboard-row">
                  <div className="col-rank" style={{ color: getRankColor(rank) }}>
                    {getRankIcon(rank)}
                  </div>
                  <div className="col-player">
                    <span className="player-address">
                      {entry.username || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                    </span>
                  </div>
                  <div className="col-score">
                    <span className="score-value">{entry.best_score.toLocaleString()}</span>
                  </div>
                  <div className="col-updated">
                    {new Date(entry.updated_at).toLocaleDateString()}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="leaderboard-footer">
        <button className="btn btn-refresh" onClick={loadLeaderboard}>
          🔄 REFRESH
        </button>
      </div>
    </div>
  )
}

export default Leaderboard

