import { useWalletKit } from '../contexts/WalletContext'
import './WalletStatus.css'

const WalletStatus = () => {
  const { isConnected, address, network } = useWalletKit()

  if (!isConnected || !address) {
    return null
  }

  return (
    <div className="wallet-status">
      <div className="wallet-status-indicator">
        <span className="status-dot"></span>
        <span className="status-text">CONNECTED</span>
      </div>
      <div className="wallet-network">
        Network: <span className="network-name">{network.toUpperCase()}</span>
      </div>
    </div>
  )
}

export default WalletStatus







