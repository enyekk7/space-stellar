import { useEffect } from 'react'
import './SuccessModal.css'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onViewCollection?: () => void
  shipName: string
  tokenId: number
  txHash: string
  pointsDeducted: number
}

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  onViewCollection,
  shipName,
  tokenId,
  txHash,
  pointsDeducted
}: SuccessModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // You could show a toast notification here
  }

  return (
    <div className="success-modal-overlay" onClick={onClose}>
      <div className="success-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="success-modal-header">
          <div className="success-icon">
            <div className="success-checkmark">
              <svg viewBox="0 0 52 52">
                <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
          </div>
          <h2 className="success-title">NFT MINTED SUCCESSFULLY!</h2>
          <button className="success-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="success-modal-content">
          <div className="success-ship-info">
            <h3 className="success-ship-name">{shipName}</h3>
            <div className="success-badge">Token ID: #{tokenId}</div>
          </div>

          <div className="success-details">
            <div className="success-detail-item">
              <span className="detail-label">Transaction Hash:</span>
              <div className="detail-value-hash">
                <span className="hash-text">{truncateHash(txHash)}</span>
                <button 
                  className="copy-button"
                  onClick={() => copyToClipboard(txHash)}
                  title="Copy full hash"
                >
                  📋
                </button>
              </div>
            </div>

            <div className="success-detail-item">
              <span className="detail-label">Points Deducted:</span>
              <span className="detail-value points-deducted">-{pointsDeducted} POINTS</span>
            </div>
          </div>

          <div className="success-actions">
            {onViewCollection && (
              <button 
                className="success-btn success-btn-primary"
                onClick={onViewCollection}
              >
                VIEW COLLECTION
              </button>
            )}
            <button 
              className="success-btn success-btn-secondary"
              onClick={onClose}
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuccessModal



