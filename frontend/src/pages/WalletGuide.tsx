import './WalletGuide.css'

const WalletGuide = () => {
  return (
    <div className="wallet-guide">
      <h2>🔗 Connect Your Stellar Wallet</h2>
      <div className="guide-content">
        <div className="guide-step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h3>Install Freighter Wallet</h3>
            <p>Download and install Freighter browser extension:</p>
            <a 
              href="https://freighter.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="guide-link"
            >
              https://freighter.app
            </a>
          </div>
        </div>

        <div className="guide-step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h3>Create or Import Wallet</h3>
            <p>Set up your Freighter wallet with a new account or import existing one.</p>
          </div>
        </div>

        <div className="guide-step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h3>Switch to Testnet</h3>
            <p>In Freighter settings, switch network to <strong>Testnet</strong> for development.</p>
          </div>
        </div>

        <div className="guide-step">
          <div className="step-number">4</div>
          <div className="step-content">
            <h3>Connect to Space Stellar</h3>
            <p>Click "CONNECT WALLET" button and approve the connection request.</p>
          </div>
        </div>
      </div>

      <div className="guide-note">
        <p>💡 <strong>Note:</strong> You need testnet XLM for transactions. Get free testnet XLM from:</p>
        <a 
          href="https://laboratory.stellar.org/#account-creator?network=test" 
          target="_blank" 
          rel="noopener noreferrer"
          className="guide-link"
        >
          Stellar Laboratory - Account Creator
        </a>
      </div>
    </div>
  )
}

export default WalletGuide







