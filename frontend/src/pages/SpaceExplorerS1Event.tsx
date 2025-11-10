import { useNavigate } from 'react-router-dom'
import { useWalletKit } from '../contexts/WalletContext'
import './SpaceExplorerS1Event.css'

const SpaceExplorerS1Event = () => {
  const navigate = useNavigate()
  const { isConnected } = useWalletKit()

  if (!isConnected) {
    return (
      <div className="event-detail-page">
        <div className="event-detail-container">
          <h1>EVENT PENJELAJAH LUAR ANGKASA</h1>
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
          <h1>🚀 PENJELAJAH LUAR ANGKASA SEASON 1</h1>
        </div>

        <div className="event-detail-content">
          <div className="event-status-banner active">
            <h2>✨ ACTIVE EVENT</h2>
            <p>Explore the vast universe and complete missions!</p>
          </div>

          <div className="event-info-section">
            <h3>About This Event</h3>
            <p>
              Embark on an epic journey through the cosmos! Complete space exploration missions, 
              discover new planets, and unlock rare explorer ships and rewards.
            </p>
          </div>

          <div className="event-info-section">
            <h3>Event Missions</h3>
            <ul className="event-features">
              <li>🌌 Explore 10 different star systems</li>
              <li>🪐 Discover 5 new planets</li>
              <li>⭐ Collect 100 space artifacts</li>
              <li>🚀 Complete 20 exploration missions</li>
            </ul>
          </div>

          <div className="event-info-section">
            <h3>Rewards</h3>
            <ul className="event-features">
              <li>🛸 Explorer Ship NFT (Rare)</li>
              <li>💎 Space Artifacts Collection</li>
              <li>⭐ Bonus XP & Points</li>
              <li>🏆 Explorer Badge</li>
            </ul>
          </div>

          <button className="event-join-btn">
            🚀 START EXPLORING
          </button>
        </div>
      </div>
    </div>
  )
}

export default SpaceExplorerS1Event



