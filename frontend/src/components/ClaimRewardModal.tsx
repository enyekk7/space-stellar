import './ClaimRewardModal.css'

interface ClaimRewardModalProps {
  isOpen: boolean
  onClose: () => void
  reward: {
    type: 'points' | 'coins'
    amount: number
  }
  missionTitle: string
}

const ClaimRewardModal = ({ isOpen, onClose, reward, missionTitle }: ClaimRewardModalProps) => {
  if (!isOpen) return null

  return (
    <div className="claim-modal-overlay" onClick={onClose}>
      <div className="claim-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="claim-modal-header">
          <div className="claim-icon">🎉</div>
          <h2>REWARD CLAIMED!</h2>
        </div>
        <div className="claim-modal-body">
          <p className="mission-completed-text">{missionTitle}</p>
          <div className="reward-display">
            <div className="reward-icon">
              {reward.type === 'points' ? '⭐' : '💰'}
            </div>
            <div className="reward-amount">
              +{reward.amount} {reward.type === 'points' ? 'Points' : 'Coins'}
            </div>
            <p className="reward-added-text">✓ Added to your account!</p>
          </div>
        </div>
        <div className="claim-modal-footer">
          <button className="claim-btn" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClaimRewardModal

