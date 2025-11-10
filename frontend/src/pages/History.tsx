import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletKit } from '../contexts/WalletContext'
import axios from 'axios'
import './History.css'

interface GameHistory {
  matchId: string
  playerId: string
  playerName: string
  roomCode: string
  score: number
  shipType: string
  shipRarity?: string
  date: string
}

const History = () => {
  const navigate = useNavigate()
  const { address } = useWalletKit()
  const [history, setHistory] = useState<GameHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (address) {
      loadHistory()
    } else {
      setLoading(false)
    }
  }, [address])

  const loadHistory = async () => {
    if (!address) return

    try {
      setLoading(true)
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/matches/history/${address}?limit=100`
      )
      
      if (response.data && response.data.success) {
        let historyData = response.data.history || []
        
        // PERBAIKAN: Urutkan berdasarkan date DESC (terbaru di atas) untuk memastikan urutan benar
        historyData.sort((a: GameHistory, b: GameHistory) => {
          const dateA = new Date(a.date).getTime()
          const dateB = new Date(b.date).getTime()
          return dateB - dateA // DESC: terbaru di atas
        })
        
        setHistory(historyData)
        console.log('✅ History loaded:', historyData.length, 'matches (sorted by date DESC)')
      } else {
        console.warn('⚠️ History response not successful:', response.data)
        setHistory([])
      }
    } catch (error: any) {
      console.error('❌ Error loading history:', error.message)
      // If backend is not available, show empty state
      if (error.code === 'ERR_NETWORK' || error.message.includes('ERR_CONNECTION_REFUSED')) {
        console.warn('⚠️ Backend not available, showing empty history')
        setHistory([])
      }
    } finally {
      setLoading(false)
    }
  }

  if (!address) {
    return (
      <div className="history-page">
        <div className="history-header">
          <h1 className="page-title">📜 MATCH HISTORY</h1>
          <button className="btn btn-back" onClick={() => navigate('/')}>
            BACK TO HOME
          </button>
        </div>
        <div className="empty-state">
          <p>Please connect your wallet to view match history</p>
        </div>
      </div>
    )
  }

  return (
    <div className="history-page">
      <div className="history-header">
        <h1 className="page-title">📜 MATCH HISTORY</h1>
        <button className="btn btn-back" onClick={() => navigate('/')}>
          BACK TO HOME
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <p className="loading">LOADING HISTORY...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <p>No game history yet</p>
          <p className="empty-hint">
            {loading 
              ? 'Loading history...' 
              : 'Play some games to see your history here! Make sure backend server is running.'}
          </p>
          {!loading && (
            <button className="btn btn-refresh" onClick={loadHistory} style={{ marginTop: '20px' }}>
              🔄 RETRY
            </button>
          )}
        </div>
      ) : (
        <div className="history-container">
          <div className="history-stats">
            <div className="stat-card">
              <div className="stat-value">{history.length}</div>
              <div className="stat-label">Total Matches</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.max(...history.map(h => h.score), 0).toLocaleString()}</div>
              <div className="stat-label">Best Score</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length).toLocaleString()}</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>

          <div className="history-table">
            <div className="history-header-row">
              <div className="col-date">DATE</div>
              <div className="col-room">ROOM</div>
              <div className="col-score">SCORE</div>
              <div className="col-ship">SHIP</div>
            </div>
            {history.map((entry) => (
              <div key={entry.matchId} className="history-row">
                <div className="col-date">
                  {new Date(entry.date).toLocaleDateString()}
                  <div className="time">{new Date(entry.date).toLocaleTimeString()}</div>
                </div>
                <div className="col-room">
                  <span className="room-code">{entry.roomCode}</span>
                </div>
                <div className="col-score">
                  <span className="score-value">{entry.score.toLocaleString()}</span>
                </div>
                  <div className="col-ship">
                    <span className="ship-type">{entry.shipType || entry.shipRarity || 'Classic'}</span>
                  </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="history-footer">
        <button className="btn btn-refresh" onClick={loadHistory}>
          🔄 REFRESH
        </button>
      </div>
    </div>
  )
}

export default History

