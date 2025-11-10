import { useEffect } from 'react'
import { useWalletKit } from '../contexts/WalletContext'
import { useNavigate } from 'react-router-dom'
import './Events.css'

const Events = () => {
  const { isConnected } = useWalletKit()
  const navigate = useNavigate()

  // Countdown untuk Event Tahun Baru 2026
  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = new Date('2026-01-01T00:00:00').getTime()
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        const countdownEl = document.getElementById('newyear-countdown')
        if (countdownEl) {
          countdownEl.textContent = 'Event Started!'
        }
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      const countdownEl = document.getElementById('newyear-countdown')
      if (countdownEl) {
        countdownEl.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isConnected) {
    return (
      <div className="events-page">
        <div className="events-container">
          <h1>EVENTS</h1>
          <p>Please connect your wallet to view events.</p>
          <button onClick={() => navigate('/')} className="btn-back">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="events-page">
      <div className="events-container">
        <div className="events-header">
          <button onClick={() => navigate('/')} className="btn-back">
            ← Back
          </button>
          <h1>🎯 EVENTS</h1>
        </div>

        <div className="events-content">
          <div className="event-card">
            <div className="event-card-header">
              <h2>Special Launch Event</h2>
              <span className="event-badge active">ACTIVE</span>
            </div>
            <div className="event-card-body">
              <p className="event-description">
                Celebrate the launch of Space Stellar! Get your exclusive NFT Profile Picture through gacha system.
              </p>
              <div className="event-details">
                <div className="event-detail">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">30 Days</span>
                </div>
                <div className="event-detail">
                  <span className="detail-label">Rewards:</span>
                  <span className="detail-value">Exclusive NFT PFP (6 Variants)</span>
                </div>
              </div>
              <button 
                className="event-action-btn"
                onClick={() => navigate('/events/special-launch')}
              >
                🎰 START GACHA
              </button>
            </div>
          </div>

          <div className="event-card">
            <div className="event-card-header">
              <h2>New Year 2026 Event</h2>
              <span className="event-badge upcoming">UPCOMING</span>
            </div>
            <div className="event-card-body">
              <p className="event-description">
                Welcome the new year 2026 with special challenges and exclusive rewards!
              </p>
              <div className="event-details">
                <div className="event-detail">
                  <span className="detail-label">Starts In:</span>
                  <span className="detail-value countdown" id="newyear-countdown">Loading...</span>
                </div>
                <div className="event-detail">
                  <span className="detail-label">Rewards:</span>
                  <span className="detail-value">Special 2026 NFT & Rewards</span>
                </div>
              </div>
              <button 
                className="event-action-btn"
                onClick={() => navigate('/events/new-year-2026')}
                disabled
              >
                ⏳ COMING SOON
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Events

