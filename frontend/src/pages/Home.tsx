import { useState, useEffect, useCallback } from 'react'
import { useWalletKit } from '../contexts/WalletContext'
import { Link, useNavigate } from 'react-router-dom'
import JoinRoomModal from '../components/JoinRoomModal'
import EventMission from '../components/EventMission'
import axios from 'axios'
import SpaceStellarNFTClient from '../contracts/client'
import { CONTRACT_ID } from '../contracts/config'
import './Home.css'

interface Ship {
  tokenId?: number
  name: string
  class: string
  rarity: string
  tier?: string
  image: string
  attack?: number
  speed?: number
  shield?: number
  owned?: boolean
}

const Home = () => {
  const { address, isConnected } = useWalletKit()
  const navigate = useNavigate()
  const [ships, setShips] = useState<Ship[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const [equippedShip, setEquippedShip] = useState<string | null>(null)
  const [showJoinRoomModal, setShowJoinRoomModal] = useState(false)

  // Load equipped ship from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`equipped_ship_${address}`)
    if (saved) {
      setEquippedShip(saved)
    }
  }, [address])

  // Load ownership status function
  const loadOwnershipStatus = useCallback(async () => {
    if (!address) return
    
    try {
      setLoading(true)
      console.log('🔄 Loading ownership status from backend/blockchain...')
      console.log('📍 Address:', address)
      
      let ownedShips: any[] = []
      
      // Try to load from backend first
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ships/collection/${address}`
        )
        
        if (response.data && response.data.ships && response.data.ships.length > 0) {
          ownedShips = response.data.ships
          console.log('✅ Loaded from backend:', ownedShips.length, 'ships')
          console.log('📦 Backend ships:', ownedShips.map((s: any) => ({ 
            tokenId: s.tokenId, 
            rarity: s.rarity, 
            class: s.class,
            name: s.name
          })))
        } else {
          console.log('⚠️ Backend returned empty collection, trying blockchain...')
          throw new Error('Empty collection from backend')
        }
      } catch (backendError: any) {
        console.warn('⚠️ Backend not available or empty, loading from blockchain...', backendError.message)
        
        // Fallback: Load directly from blockchain contract
        try {
          console.log('📡 Loading collection from blockchain contract...')
          const contractClient = new SpaceStellarNFTClient(CONTRACT_ID)
          const collection = await contractClient.getCollection(address)
          
          console.log('✅ Collection loaded from blockchain:', collection.length, 'ships')
          console.log('📦 Blockchain ships:', collection.map((item: any) => ({ 
            tokenId: item.tokenId, 
            rarity: item.rarity, 
            tier: item.tier,
            class: item.class
          })))
          
          // Convert to format compatible with Home page
          // Home page uses: 'Common', 'Epic', 'Legendary', 'Master', 'Ultra'
          ownedShips = collection.map((item: any) => {
            // Map rarity/tier from contract to Home page format
            // Keep ALL original values for robust matching
            const rarity = item.rarity || 'Common'
            const tier = item.tier || rarity
            
            // Map tier to rarity if needed (Elite -> Common for display)
            let mappedRarity = rarity
            if (tier === 'Elite') {
              mappedRarity = 'Common'
            } else if (tier && ['Epic', 'Legendary', 'Master', 'Ultra'].includes(tier)) {
              mappedRarity = tier
            }
            
            console.log(`   Ship ${item.tokenId}: rarity=${rarity}, tier=${tier}, mapped=${mappedRarity}`)
            
            return {
              tokenId: item.tokenId,
              rarity: mappedRarity, // For display
              class: item.class || 'Fighter',
              tier: tier, // Keep original tier
              // Include ALL original values for matching (critical!)
              originalRarity: rarity, // Original from contract
              originalTier: tier, // Original from contract
              // Also include both values as arrays for flexible matching
              rarityVariants: [rarity, mappedRarity, tier === 'Elite' ? 'Common' : rarity].filter((v, i, arr) => arr.indexOf(v) === i), // Unique values
              tierVariants: [tier, tier === 'Elite' ? 'Common' : tier].filter((v, i, arr) => arr.indexOf(v) === i) // Unique values
            }
          })
          
          console.log('📦 Processed ownedShips with all variants:', ownedShips.map((s: any) => ({
            tokenId: s.tokenId,
            rarity: s.rarity,
            tier: s.tier,
            originalRarity: s.originalRarity,
            originalTier: s.originalTier,
            rarityVariants: s.rarityVariants,
            tierVariants: s.tierVariants
          })))
          
          console.log('✅ Converted collection:', ownedShips)
        } catch (blockchainError: any) {
          console.error('❌ Error loading from blockchain:', blockchainError.message)
          // Keep ships as initialized (Classic owned, others not)
        }
      }
      
      console.log('🔍 Checking ownership for', ownedShips.length, 'ships from collection')
      console.log('📋 Collection ships:', ownedShips.map((s: any) => ({ 
        tokenId: s.tokenId, 
        rarity: s.rarity, 
        tier: s.tier,
        class: s.class 
      })))
      
      // Update ownership status for each ship
      setShips(prevShips => {
        const updated = prevShips.map(ship => {
          // Classic ship is always owned
          if (ship.rarity === 'Classic') {
            return { ...ship, owned: true }
          }
          
          // Check if ship is owned by matching rarity/tier
          // Home page ships:
          // - Elite Fighter: rarity='Common', tier='Elite'
          // - Epic Destroyer: rarity='Epic', tier='Epic'
          // - Legendary Cruiser: rarity='Legendary', tier='Legendary'
          // - Master Battleship: rarity='Master', tier='Master'
          // - Ultra Command: rarity='Ultra', tier='Ultra'
          
          const isOwned = ownedShips.some((s: any) => {
            // PERBAIKAN: Matching lebih ketat berdasarkan tier untuk menghindari Elite dan Master kebuka semua
            
            // Strategy 1: Match by tokenId (most reliable - exact match)
            if (ship.tokenId && s.tokenId && ship.tokenId === s.tokenId) {
              console.log(`   ✅ Match by tokenId: ${ship.name} (tokenId: ${ship.tokenId})`)
              return true
            }
            
            // Strategy 2: Match by tier (exact match) - PRIORITAS TERTINGGI
            // Ini memastikan Elite hanya match dengan Elite, Master hanya match dengan Master
            if (ship.tier && s.tier && s.tier === ship.tier) {
              console.log(`   ✅ Match by tier (exact): ${ship.name} (tier: ${ship.tier})`)
              return true
            }
            
            // Strategy 3: Match by originalTier (from contract) - untuk memastikan tier dari contract match
            if (ship.tier && s.originalTier && s.originalTier === ship.tier) {
              console.log(`   ✅ Match by originalTier: ${ship.name} (tier: ${ship.tier})`)
              return true
            }
            
            // Strategy 4: Special case: Elite Fighter (tier='Elite', rarity='Common')
            // Hanya match jika tier adalah 'Elite' atau rarity adalah 'Common' DAN tier adalah 'Elite'
            if (ship.tier === 'Elite') {
              // Hanya match jika owned ship juga Elite (tier atau originalTier)
              if (s.tier === 'Elite' || s.originalTier === 'Elite') {
                console.log(`   ✅ Match Elite: ${ship.name}`)
                return true
              }
              // Juga match jika rarity adalah Common DAN tier adalah Elite (untuk backward compatibility)
              if ((s.rarity === 'Common' || s.originalRarity === 'Common') && 
                  (s.tier === 'Elite' || s.originalTier === 'Elite')) {
                console.log(`   ✅ Match Elite->Common: ${ship.name}`)
                return true
              }
            }
            
            // Strategy 5: Match by rarity (exact match) - HANYA jika tier tidak ada
            // Ini untuk backward compatibility jika contract tidak menyimpan tier
            if (!ship.tier && ship.rarity && s.rarity && s.rarity === ship.rarity) {
              console.log(`   ✅ Match by rarity (no tier): ${ship.name} (rarity: ${ship.rarity})`)
              return true
            }
            
            // Strategy 6: Match by originalRarity (from contract) - HANYA jika tier tidak ada
            if (!ship.tier && ship.rarity && s.originalRarity && s.originalRarity === ship.rarity) {
              console.log(`   ✅ Match by originalRarity (no tier): ${ship.name} (rarity: ${ship.rarity})`)
              return true
            }
            
            // Strategy 7: Match by class + tier combination (untuk memastikan spesifik)
            if (ship.class && s.class && ship.class === s.class && ship.tier && s.tier && s.tier === ship.tier) {
              console.log(`   ✅ Match by class+tier: ${ship.name}`)
              return true
            }
            
            return false
          })
          
          if (isOwned) {
            console.log(`✅ Ship OWNED: ${ship.name} (rarity: ${ship.rarity}, tier: ${ship.tier})`)
          } else {
            console.log(`❌ Ship NOT OWNED: ${ship.name} (rarity: ${ship.rarity}, tier: ${ship.tier})`)
          }
          
          return { ...ship, owned: isOwned }
        })
        
        // Set current index to equipped ship if exists
        if (equippedShip) {
          const index = updated.findIndex(s => 
            s.rarity === equippedShip || 
            (equippedShip === 'Classic' && s.rarity === 'Classic')
          )
          if (index >= 0) {
            setCurrentIndex(index)
          }
        }
        
        // Log owned ships count
        const ownedCount = updated.filter(s => s.owned).length
        console.log(`📊 Ownership status: ${ownedCount}/${updated.length} ships owned`)
        console.log('✅ Ships updated:', updated.map(s => ({ 
          name: s.name, 
          owned: s.owned, 
          rarity: s.rarity, 
          tier: s.tier 
        })))
        
        return updated
      })
    } catch (error: any) {
      console.error('❌ Error loading ownership:', error)
      // Keep ships as initialized (Classic owned, others not)
    } finally {
      setLoading(false)
    }
  }, [address, equippedShip])

  // Initialize all ships (always show all 6 ships)
  useEffect(() => {
    const allShips: Ship[] = [
      {
        name: 'Classic Fighter',
        class: 'Fighter',
        rarity: 'Classic',
        tier: 'Classic',
        image: '/nft-images/ships/ship-classic.gif',
        owned: true
      },
      {
        name: 'Elite Fighter',
        class: 'Fighter',
        rarity: 'Common',
        tier: 'Elite', // Fixed: was 'Elite', should match contract
        image: '/nft-images/ships/ship-elite.gif',
        attack: 10,
        speed: 8,
        shield: 12,
        owned: false // Will be updated after loading collection
      },
      {
        name: 'Epic Destroyer',
        class: 'Destroyer',
        rarity: 'Epic',
        tier: 'Epic',
        image: '/nft-images/ships/ship-epic.gif',
        attack: 20,
        speed: 6,
        shield: 18,
        owned: false
      },
      {
        name: 'Legendary Cruiser',
        class: 'Cruiser',
        rarity: 'Legendary',
        tier: 'Legendary',
        image: '/nft-images/ships/ship-legendary.gif',
        attack: 30,
        speed: 15,
        shield: 25,
        owned: false
      },
      {
        name: 'Master Battleship',
        class: 'Battleship',
        rarity: 'Master',
        tier: 'Master',
        image: '/nft-images/ships/ship-master.gif',
        attack: 40,
        speed: 12,
        shield: 35,
        owned: false
      },
      {
        name: 'Ultra Command',
        class: 'Command',
        rarity: 'Ultra',
        tier: 'Ultra',
        image: '/nft-images/ships/ship-ultra.gif',
        attack: 50,
        speed: 18,
        shield: 45,
        owned: false
      }
    ]
    
    setShips(allShips)
    
    // Load ownership status if connected
    if (isConnected && address) {
      loadOwnershipStatus()
    }
  }, [isConnected, address, loadOwnershipStatus])

  const currentShip = ships[currentIndex] || ships[0]

  const nextShip = () => {
    setCurrentIndex((prev) => (prev + 1) % ships.length)
  }

  const prevShip = () => {
    setCurrentIndex((prev) => (prev - 1 + ships.length) % ships.length)
  }

  const handleEquip = () => {
    if (!currentShip?.owned) {
      // Redirect to store to buy
      navigate('/store')
      return
    }
    
    // PERBAIKAN: Langsung equip tanpa pop-up
    // PERBAIKAN: Gunakan tier jika ada (untuk Elite Fighter, tier='Elite' bukan rarity='Common')
    if (address && currentShip) {
      const shipToEquip = currentShip.tier || currentShip.rarity
      localStorage.setItem(`equipped_ship_${address}`, shipToEquip)
      setEquippedShip(shipToEquip)
      console.log(`✅ ${currentShip.name} equipped successfully (${shipToEquip})`)
      // Tidak ada alert/pop-up, langsung equip
    }
  }

  const handlePlay = async (mode: 'solo' | 'multiplayer') => {
    if (!address || !currentShip) {
      alert('Please connect wallet and select a ship')
      return
    }

    if (!currentShip.owned) {
      // Button is disabled, but just in case
      alert('You need to own this ship to play!')
      navigate('/store')
      return
    }

    try {
      // Generate room code
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Get ship image path
      const getShipImagePath = (rarity: string) => {
        const imageMap: { [key: string]: string } = {
          'Classic': '/nft-images/ships/ship-classic.gif',
          'Common': '/nft-images/ships/ship-elite.gif',
          'Elite': '/nft-images/ships/ship-elite.gif',
          'Epic': '/nft-images/ships/ship-epic.gif',
          'Legendary': '/nft-images/ships/ship-legendary.gif',
          'Master': '/nft-images/ships/ship-master.gif',
          'Ultra': '/nft-images/ships/ship-ultra.gif'
        }
        return imageMap[rarity] || '/nft-images/ships/ship-classic.gif'
      }

      // Create room in backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/rooms/create`,
        {
          roomCode,
          mode,
          address,
          shipRarity: currentShip.rarity,
          shipName: currentShip.name,
          shipClass: currentShip.class,
          shipImage: currentShip.image || getShipImagePath(currentShip.rarity)
        }
      )

      if (response.data.success) {
        // Navigate to room with mode parameter
        navigate(`/room/${roomCode}?mode=${mode}`)
      } else {
        throw new Error('Failed to create room')
      }
    } catch (error: any) {
      console.error('Error creating room:', error)
      // Still navigate even if backend fails (game can work offline)
      const roomCode = Math.floor(100000 + Math.random() * 900000).toString()
      navigate(`/room/${roomCode}?mode=${mode}`)
    }
  }

  const handleJoinRoom = async (roomCode: string) => {
    if (!address || !currentShip) {
      alert('Please connect wallet and select a ship')
      setShowJoinRoomModal(false)
      return
    }

    if (!currentShip.owned) {
      alert('You need to own this ship to play!')
      setShowJoinRoomModal(false)
      navigate('/store')
      return
    }

    try {
      // Get ship image path
      const getShipImagePath = (rarity: string) => {
        const imageMap: { [key: string]: string } = {
          'Classic': '/nft-images/ships/ship-classic.gif',
          'Common': '/nft-images/ships/ship-elite.gif',
          'Elite': '/nft-images/ships/ship-elite.gif',
          'Epic': '/nft-images/ships/ship-epic.gif',
          'Legendary': '/nft-images/ships/ship-legendary.gif',
          'Master': '/nft-images/ships/ship-master.gif',
          'Ultra': '/nft-images/ships/ship-ultra.gif'
        }
        return imageMap[rarity] || '/nft-images/ships/ship-classic.gif'
      }

      // PERBAIKAN: Gunakan tier jika ada (untuk Elite Fighter, tier='Elite' bukan rarity='Common')
      const shipRarity = currentShip.tier || currentShip.rarity
      const shipName = currentShip.tier ? `${currentShip.tier} Fighter` : currentShip.name
      
      // Join room in backend
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/rooms/${roomCode}/join`,
        {
          address,
          shipRarity: shipRarity,
          shipName: shipName,
          shipClass: currentShip.class,
          shipImage: currentShip.image || getShipImagePath(shipRarity)
        }
      )

      if (response.data.success) {
        setShowJoinRoomModal(false)
        // Navigate to room
        navigate(`/room/${roomCode}`)
      } else {
        throw new Error(response.data.message || 'Failed to join room')
      }
    } catch (error: any) {
      console.error('Error joining room:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to join room'
      alert(`Error: ${errorMessage}`)
      // Still navigate even if backend fails (game can work offline)
      // navigate(`/room/${roomCode}`)
    }
  }

  const isEquipped = equippedShip === currentShip?.rarity

  return (
    <div className="home">
      {/* Event Mission & ID Card - Only show when wallet connected */}
      {isConnected && address && (
        <div className="home-sidebar">
          <div className="sidebar-buttons-row">
            <EventMission address={address} />
          </div>
        </div>
      )}
      
      <div className="hero">
        <h1 className="hero-title glow">SPACE STELLAR</h1>
        <p className="hero-subtitle">NFT Space Shooter Game</p>
        <p className="hero-description">
          Collect unique NFT ships, battle in space, and climb the leaderboard!
        </p>
        
        {!isConnected ? (
          <div className="hero-cta">
            <p className="cta-text">Connect your Stellar wallet to start playing</p>
          </div>
        ) : (
          <>
            {/* Current Ship Display */}
            <div className="current-ship">
              <div className="current-ship-label">CURRENT SHIP</div>
              <div className="current-ship-container">
                <button 
                  className="ship-nav-btn ship-nav-prev"
                  onClick={prevShip}
                  aria-label="Previous ship"
                  type="button"
                >
                  ‹
                </button>
                
                <div className={`current-ship-card ${!currentShip?.owned ? 'locked' : ''} ${isEquipped ? 'equipped' : ''}`}>
                  {!currentShip?.owned && (
                    <div className="ship-locked-overlay">
                      <div className="lock-icon">🔒</div>
                      <div className="lock-text">LOCKED</div>
                    </div>
                  )}
                  <div className="current-ship-image">
                    <img 
                      src={currentShip?.image || '/nft-images/ships/ship-classic.gif'} 
                      alt={currentShip?.name || 'Ship'}
                      className={!currentShip?.owned ? 'locked-image' : ''}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = '🚀';
                        }
                      }}
                    />
                  </div>
                  <div className="current-ship-name">{currentShip?.name || 'Classic Fighter'}</div>
                  <div className="current-ship-tier">{currentShip?.tier || 'Classic'}</div>
                  {currentShip?.owned && currentShip.attack && (
                    <div className="current-ship-stats">
                      <span>⚔️ {currentShip.attack}</span>
                      <span>⚡ {currentShip.speed}</span>
                      <span>🛡️ {currentShip.shield}</span>
                    </div>
                  )}
                </div>
                
                <button 
                  className="ship-nav-btn ship-nav-next"
                  onClick={nextShip}
                  aria-label="Next ship"
                  type="button"
                >
                  ›
                </button>
              </div>
              
              <div className="current-ship-actions">
                <div className="ship-action-buttons">
                  {/* Buy/Equip button */}
                  <div className="buy-equip-section">
                    {!currentShip?.owned ? (
                      <Link 
                        to="/store"
                        className="btn btn-buy btn-large"
                      >
                        BUY IN STORE
                      </Link>
                    ) : (
                      <>
                        <button 
                          className={`btn btn-equip ${isEquipped ? 'btn-equipped' : ''}`}
                          onClick={handleEquip}
                        >
                          {isEquipped ? '✓ EQUIPPED' : 'EQUIP'}
                        </button>
                        {isEquipped && (
                          <div className="equipped-status">
                            EQUIPPED
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  
                  {/* Play buttons - always visible but disabled if ship not owned */}
                  <div className="play-buttons-container">
                    <button 
                      className={`btn btn-play-solo ${!currentShip?.owned ? 'btn-disabled' : ''}`}
                      onClick={() => handlePlay('solo')}
                      disabled={!currentShip?.owned}
                      title={!currentShip?.owned ? 'You need to own this ship to play' : 'Start solo game'}
                    >
                      PLAY SOLO
                    </button>
                    <button 
                      className={`btn btn-play-multi ${!currentShip?.owned ? 'btn-disabled' : ''}`}
                      onClick={() => handlePlay('multiplayer')}
                      disabled={!currentShip?.owned}
                      title={!currentShip?.owned ? 'You need to own this ship to play' : 'Create multiplayer room'}
                    >
                      CREATE ROOM
                    </button>
                    <button 
                      className={`btn btn-join-room ${!currentShip?.owned ? 'btn-disabled' : ''}`}
                      onClick={() => setShowJoinRoomModal(true)}
                      disabled={!currentShip?.owned}
                      title={!currentShip?.owned ? 'You need to own this ship to play' : 'Join multiplayer room'}
                    >
                      JOIN ROOM
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading indicator */}
            {loading && (
              <div style={{ marginTop: '20px', color: '#00ff41', fontSize: '12px' }}>
                🔄 Loading ship ownership...
              </div>
            )}
          </>
        )}
      </div>

      {/* Join Room Modal */}
      <JoinRoomModal
        isOpen={showJoinRoomModal}
        onClose={() => setShowJoinRoomModal(false)}
        onJoin={handleJoinRoom}
      />
    </div>
  )
}

export default Home
