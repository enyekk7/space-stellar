import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletKit } from '../contexts/WalletContext'
import './NewYear2026Event.css'

const NewYear2026Event = () => {
  const navigate = useNavigate()
  const { isConnected } = useWalletKit()

  useEffect(() => {
    const updateCountdown = () => {
      const targetDate = new Date('2026-01-01T00:00:00').getTime()
      const now = new Date().getTime()
      const distance = targetDate - now

      if (distance < 0) {
        const countdownEl = document.getElementById('event-countdown')
        if (countdownEl) {
          countdownEl.textContent = 'Event Started!'
        }
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      const countdownEl = document.getElementById('event-countdown')
      if (countdownEl) {
        countdownEl.textContent = `${days} Days ${hours} Hours ${minutes} Minutes ${seconds} Seconds`
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isConnected) {
    return (
      <div className="event-detail-page">
        <div className="event-detail-container">
          <h1>EVENT TAHUN BARU 2026</h1>
          <p>Please connect your wallet to view event details.</p>
          <button onClick={() => navigate('/')} className="btn-back">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="event-detail-page">
      <div className="event-detail-container">
        <div className="event-detail-header">
          <button onClick={() => navigate('/events')} className="btn-back">
            ← Back
          </button>
          <h1>🎉 EVENT TAHUN BARU 2026</h1>
        </div>

        <div className="event-detail-content">
          <div className="event-status-banner upcoming">
            <h2>⏳ COMING SOON</h2>
            <p>This event will start on January 1, 2026</p>
          </div>

          <div className="event-info-section">
            <h3>About This Event</h3>
            <p>
              Welcome the new year 2026 with special challenges and exclusive rewards! 
              Complete unique missions, participate in tournaments, and earn special 2026-themed NFTs.
            </p>
          </div>

          <div className="event-info-section">
            <h3>Event Features</h3>
            <ul className="event-features">
              <li>🎁 Special 2026 NFT Collection</li>
              <li>🏆 New Year Tournament</li>
              <li>🎯 Exclusive Missions</li>
              <li>💰 Bonus Rewards</li>
            </ul>
          </div>

          <div className="event-info-section">
            <h3>Countdown</h3>
            <div className="countdown-display" id="event-countdown">
              Loading...
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NewYear2026Event

