import { useNavigate } from 'react-router-dom'
import { useWalletKit } from '../contexts/WalletContext'
import './IDCard.css'

const IDCard = () => {
  const { address, isConnected } = useWalletKit()
  const navigate = useNavigate()

  if (!isConnected || !address) {
    return null
  }

  const getAvatar = (addr: string) => {
    return addr.charAt(0).toUpperCase()
  }

  const handleClick = () => {
    navigate('/profile')
  }

  return (
    <button className="id-card-btn" onClick={handleClick}>
      <div className="id-card-icon">
        <div className="card-icon">🆔</div>
      </div>
      <div className="id-card-label">ID CARD</div>
    </button>
  )
}

export default IDCard

