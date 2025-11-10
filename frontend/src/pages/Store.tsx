import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWalletKit } from '../contexts/WalletContext'
import axios from 'axios'
import SpaceStellarNFTClient from '../contracts/client'
import SuccessModal from '../components/SuccessModal'
import './Store.css'

interface ShipTemplate {
  id: number
  name: string
  class: string
  rarity: string
  tier?: string
  attack: number
  speed: number
  shield: number
  price: number
  image: string
}

const Store = () => {
  const navigate = useNavigate()
  const { address, publicKey, isConnected, signTransaction } = useWalletKit()
  const [ships, setShips] = useState<ShipTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [minting, setMinting] = useState<number | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [mintResult, setMintResult] = useState<{
    shipName: string
    tokenId: number
    txHash: string
    pointsDeducted: number
  } | null>(null)

  useEffect(() => {
    // Load ship templates - 5 NFT tiers (Classic tidak ada di store, default untuk semua)
    const templates: ShipTemplate[] = [
      {
        id: 1,
        name: 'Elite Fighter',
        class: 'Fighter',
        rarity: 'Common',
        tier: 'Elite',
        attack: 10,
        speed: 8,
        shield: 12,
        price: 10, // Elite Fighter price: 10 Points
        image: '/nft-images/ships/ship-elite.gif'
      },
      {
        id: 2,
        name: 'Epic Destroyer',
        class: 'Destroyer',
        rarity: 'Epic',
        tier: 'Epic',
        attack: 20,
        speed: 6,
        shield: 18,
        price: 50,
        image: '/nft-images/ships/ship-epic.gif'
      },
      {
        id: 3,
        name: 'Legendary Cruiser',
        class: 'Cruiser',
        rarity: 'Legendary',
        tier: 'Legendary',
        attack: 30,
        speed: 15,
        shield: 25,
        price: 100,
        image: '/nft-images/ships/ship-legendary.gif'
      },
      {
        id: 4,
        name: 'Master Battleship',
        class: 'Battleship',
        rarity: 'Master',
        tier: 'Master',
        attack: 40,
        speed: 12,
        shield: 35,
        price: 200,
        image: '/nft-images/ships/ship-master.gif'
      },
      {
        id: 5,
        name: 'Ultra Command',
        class: 'Command',
        rarity: 'Ultra',
        tier: 'Ultra',
        attack: 50,
        speed: 18,
        shield: 45,
        price: 500,
        image: '/nft-images/ships/ship-ultra.gif'
      }
    ]
    setShips(templates)
  }, [])

  const handleMint = async (ship: ShipTemplate) => {
    if (!address || !publicKey) {
      alert('Please connect your wallet first')
      return
    }

    // Get contract ID - use new public mint contract by default
    const contractId = import.meta.env.VITE_CONTRACT_ID || 'CC7MQ3BSNULZ4YX62OMZOZ2RYTZEMUJEWITQJH7YBVXJL75QIZMS2PTX'
    console.log('📋 Using Contract ID:', contractId)

    setMinting(ship.id)
    setLoading(true)

    try {
      // Step 1: Upload metadata to IPFS first (with fallback if backend unavailable)
      let ipfsCid: string
      let metadataUri: string
      
      try {
        console.log('📤 Uploading metadata to IPFS...')
        const metadataResponse = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ipfs/upload-metadata`,
          {
            name: `${ship.name} #${Date.now()}`,
            description: `A ${ship.tier || ship.rarity} tier ${ship.class} ship for Space Stellar - ${ship.rarity} rarity`,
            tier: ship.tier || ship.rarity,
            class: ship.class,
            rarity: ship.rarity,
            attack: ship.attack,
            speed: ship.speed,
            shield: ship.shield,
            attributes: [
              { trait_type: 'Tier', value: ship.tier || ship.rarity },
              { trait_type: 'Class', value: ship.class },
              { trait_type: 'Rarity', value: ship.rarity },
              { trait_type: 'Attack', value: ship.attack, display_type: 'number' },
              { trait_type: 'Speed', value: ship.speed, display_type: 'number' },
              { trait_type: 'Shield', value: ship.shield, display_type: 'number' },
              { trait_type: 'Total Stats', value: ship.attack + ship.speed + ship.shield, display_type: 'number' }
            ]
          }
        )

        if (!metadataResponse.data.success) {
          throw new Error('Failed to upload metadata to IPFS')
        }

        ipfsCid = metadataResponse.data.metadataCid
        metadataUri = metadataResponse.data.ipfsUri || `ipfs://${ipfsCid}`
        console.log('✅ Metadata uploaded:', ipfsCid)
      } catch (ipfsError: any) {
        // Fallback: Use dummy metadata if backend/IPFS unavailable
        console.warn('⚠️ IPFS upload failed, using fallback metadata:', ipfsError.message)
        const timestamp = Date.now()
        ipfsCid = `QmDummy${timestamp}${ship.id}`
        metadataUri = `ipfs://${ipfsCid}`
        console.log('📝 Using fallback metadata CID:', ipfsCid)
      }

      // Step 2: Invoke smart contract to mint NFT
      // This will show Freighter wallet popup for confirmation
      // Public mint function - anyone can mint
      console.log('🔐 Requesting wallet signature for mint transaction...')
      
      const contractClient = new SpaceStellarNFTClient(contractId)
      console.log(`💰 Minting ${ship.name} for ${ship.price} points`)
      console.log('   Points will be deducted AFTER successful mint')
      
      // PERBAIKAN: Log data yang akan dikirim ke contract
      const mintRarity = ship.rarity
      const mintTier = ship.tier || ship.rarity
      const mintClass = ship.class
      
      console.log('📤 MINTING NFT WITH DATA:')
      console.log(`   Ship Name: ${ship.name}`)
      console.log(`   Class: ${mintClass}`)
      console.log(`   Rarity: ${mintRarity}`)
      console.log(`   Tier: ${mintTier}`)
      console.log(`   Attack: ${ship.attack}`)
      console.log(`   Speed: ${ship.speed}`)
      console.log(`   Shield: ${ship.shield}`)
      console.log(`   IPFS CID: ${ipfsCid}`)
      
      // Mint NFT first (points belum dipotong)
      const result = await contractClient.mint(
        signTransaction, // Wallet signer function (will show Freighter popup)
        publicKey, // Source account (anyone can mint)
        address, // To address (recipient)
        mintClass, // PERBAIKAN: Gunakan variabel yang sudah di-log
        mintRarity, // PERBAIKAN: Gunakan variabel yang sudah di-log
        mintTier, // PERBAIKAN: Gunakan variabel yang sudah di-log
        ship.attack,
        ship.speed,
        ship.shield,
        ipfsCid,
        metadataUri,
        ship.price // Price in points - will be checked before mint, deducted after success
      )

      console.log('✅ NFT minted successfully!', result)
      
      // ============================================================
      // DEDUCT POINTS AFTER SUCCESSFUL MINT
      // ============================================================
      if (ship.price && ship.price > 0) {
        console.log(`\n💰 Deducting ${ship.price} points after successful mint...`)
        console.log(`   Address: ${address}`)
        console.log(`   Amount: ${ship.price} points`)
        
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
          const deductResponse = await fetch(`${apiUrl}/api/points/deduct`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              address: address,
              amount: ship.price,
              reason: 'Mint NFT'
            })
          })
          
          const deductResult = await deductResponse.json()
          
          if (!deductResult.success) {
            // NFT sudah di-mint, tapi points gagal dipotong
            // Ini seharusnya tidak terjadi karena sudah di-check sebelumnya
            console.error('⚠️ WARNING: NFT minted but points deduction failed!')
            console.error('   This should not happen - points were checked before mint')
            console.error('   NFT is still valid on-chain, but points were not deducted')
            // Jangan throw error, karena NFT sudah berhasil di-mint
            // User bisa contact admin untuk fix points
          } else {
            console.log('✅ Points deducted successfully')
            console.log(`   Remaining points: ${deductResult.points}`)
          }
        } catch (pointsError: any) {
          // NFT sudah di-mint, tapi points gagal dipotong
          console.error('⚠️ WARNING: NFT minted but points deduction failed!', pointsError)
          console.error('   NFT is still valid on-chain, but points were not deducted')
          // Jangan throw error, karena NFT sudah berhasil di-mint
          // User bisa contact admin untuk fix points
        }
      }

      // Step 3: Save to database for indexing (optional)
      try {
        await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ships/index`, {
          address,
          tokenId: result.tokenId,
          txHash: result.txHash,
          shipTemplate: ship,
          ipfsCid,
          metadataUri
        })
      } catch (dbError) {
        console.warn('⚠️ Failed to index in database (NFT is still minted on-chain):', dbError)
      }

      console.log(`✅ NFT minted successfully! Token ID: ${result.tokenId}, TX: ${result.txHash}`)
      
      // Wait for database indexing and blockchain confirmation
      console.log('⏳ Waiting for database indexing...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Show success modal instead of alert
      setMintResult({
        shipName: ship.name,
        tokenId: result.tokenId,
        txHash: result.txHash,
        pointsDeducted: ship.price
      })
      setShowSuccessModal(true)
    } catch (error: any) {
      console.error('❌ Mint error:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      // Handle user rejection (simplified error messages)
      if (error.message?.includes('rejected') || error.message?.includes('denied') || error.message?.includes('User rejected')) {
        // User cancelled, no need to show error
        console.log('User cancelled transaction')
      } else if (error.message?.includes('Insufficient points')) {
        alert(`❌ ${error.message}`)
      } else {
        // Show simplified error message
        const errorMsg = error.message || 'Unknown error'
        alert(`❌ Mint Error: ${errorMsg}`)
      }
    } finally {
      setLoading(false)
      setMinting(null)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#00ffff' // Cyan for Elite
      case 'Epic': return '#ff00ff' // Magenta for Epic
      case 'Legendary': return '#ffaa00' // Orange/Gold for Legendary
      case 'Master': return '#ff6600' // Dark Orange for Master
      case 'Ultra': return '#ffd700' // Gold for Ultra
      default: return '#ffffff'
    }
  }

  const getTierDisplay = (tier?: string, rarity?: string) => {
    // Use tier if available, otherwise use rarity
    const display = tier || rarity || 'Unknown'
    return display.toUpperCase()
  }

  if (!isConnected || !address) {
    return (
      <div className="store">
        <div className="store-empty">
          <h2>CONNECT WALLET</h2>
          <p>Please connect your Stellar wallet to mint ships</p>
          <p style={{ marginTop: '20px', fontSize: '10px', color: '#888' }}>
            Install Freighter wallet extension and connect to continue
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="store">
      <h1 className="page-title">SHIP STORE</h1>
      <p className="page-subtitle">Mint your NFT ships and start playing!</p>

      <div className="ships-grid">
        {ships.map((ship) => (
          <div key={ship.id} className="ship-card card">
            <div className="ship-image">
              <img 
                src={ship.image} 
                alt={ship.name}
                onError={(e) => {
                  // Fallback to emoji if image fails to load
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = ship.id === 1 ? '🚀' : ship.id === 2 ? '🛸' : ship.id === 3 ? '🛰️' : '🌟';
                  }
                }}
                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
              />
            </div>
            <div className="ship-info">
              <h3 className="ship-name">{ship.name}</h3>
              <div 
                className="ship-rarity"
                style={{ color: getRarityColor(ship.rarity) }}
              >
                {getTierDisplay(ship.tier, ship.rarity)}
              </div>
              <div className="ship-stats">
                <div className="stat">
                  <span>⚔️ ATK:</span>
                  <span>{ship.attack}</span>
                </div>
                <div className="stat">
                  <span>⚡ SPD:</span>
                  <span>{ship.speed}</span>
                </div>
                <div className="stat">
                  <span>🛡️ SHD:</span>
                  <span>{ship.shield}</span>
                </div>
              </div>
              <div className="ship-price">
                <span className="price-label">PRICE:</span>
                <span className="price-value">{ship.price} POINTS</span>
              </div>
              <button
                className="btn btn-mint"
                onClick={() => handleMint(ship)}
                disabled={loading || minting === ship.id}
              >
                {minting === ship.id ? 'MINTING...' : 'MINT SHIP'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Success Modal */}
      {mintResult && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false)
            setMintResult(null)
          }}
          onViewCollection={() => {
            setShowSuccessModal(false)
            setMintResult(null)
            navigate('/collection')
          }}
          shipName={mintResult.shipName}
          tokenId={mintResult.tokenId}
          txHash={mintResult.txHash}
          pointsDeducted={mintResult.pointsDeducted}
        />
      )}
    </div>
  )
}

export default Store


