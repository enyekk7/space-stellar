# 🚀 Space Stellar

<div align="center">

**A Next-Generation NFT-Based Space Shooter Game on Stellar Blockchain**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet-orange.svg)](https://www.stellar.org/)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-purple.svg)](https://soroban.stellar.org/)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6.svg)](https://www.typescriptlang.org/)

[Features](#-features) • [Installation](#-installation) • [Smart Contracts](#-smart-contracts) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

**Space Stellar** is a decentralized web3 game built on the Stellar blockchain, combining NFT collectibles with real-time space shooter gameplay. Players can collect unique NFT ships with varying rarities and stats, compete in solo or multiplayer modes, and climb global leaderboards.

### Key Highlights

- 🎮 **Real-time Gameplay**: Fast-paced space shooter with smooth 60 FPS gameplay
- 🎨 **NFT Collection System**: 6-tier ship system with unique attributes and rarities
- 🏆 **Competitive Leaderboards**: Global rankings and match history tracking
- 🌐 **Multiplayer Support**: Solo and versus modes with room-based matchmaking
- 🔐 **Stellar Wallet Integration**: Seamless connection with Stellar Wallet Kit
- 📦 **Smart Contracts**: Deployed on Stellar Testnet using Soroban

---

## ✨ Features

### 🎮 Game Features

- **Space Shooter Mechanics**
  - Player ship movement (WASD/Arrow Keys)
  - Shooting system with customizable fire rates
  - Enemy spawning with difficulty scaling
  - Collision detection and health system
  - Score tracking and coin collection
  - Power-ups and special abilities

- **Game Modes**
  - **Solo Mode**: Single-player gameplay with global leaderboard
  - **Multiplayer Mode**: Room-based versus matches with real-time synchronization

- **Ship System**
  - 6-tier rarity system (Classic, Elite, Epic, Legendary, Master, Ultra)
  - Unique stats per tier (Attack, Speed, Shield)
  - Dynamic ship attributes affecting gameplay
  - Visual ship representation with GIF animations

### 🎨 NFT Features

- **NFT Minting**
  - Mint unique ship NFTs directly from the store
  - IPFS-based metadata storage
  - On-chain attribute storage (class, rarity, tier, stats)
  - Sequential token ID assignment

- **Collection Management**
  - View owned NFTs in collection page
  - Ship equipping system
  - Profile picture (PFP) NFT support
  - Transfer and ownership tracking

### 🏆 Social Features

- **Leaderboards**
  - Global top players ranking
  - Best score tracking per player
  - Real-time leaderboard updates

- **Match History**
  - Complete game history per player
  - Match statistics (score, duration, mode)
  - Room code tracking

- **Profile System**
  - User profile with statistics
  - NFT ownership display
  - Achievement tracking

---

## 🏗️ Architecture

```
space-stellar/
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── contexts/       # React contexts (Wallet)
│   │   ├── contracts/      # Generated contract clients
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
│
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   └── middleware/     # Express middleware
│   └── package.json
│
├── contracts/               # Soroban smart contracts (Rust)
│   ├── space_stellar_nft/  # Main NFT contract
│   │   ├── src/lib.rs      # Contract implementation
│   │   └── Cargo.toml
│   ├── space_stellar_pfp/  # Profile Picture NFT contract
│   │   ├── src/lib.rs      # PFP contract implementation
│   │   └── Cargo.toml
│   └── Cargo.toml          # Workspace configuration
│
├── scripts/                # Deployment and utility scripts
├── scaffold.config.js      # Scaffold Stellar configuration
└── package.json            # Root package.json
```

### Technology Stack

**Frontend:**
- React 19.1.1 with TypeScript
- Vite 7.1.11 for build tooling
- Stellar Wallet Kit for wallet integration
- React Router for navigation
- TanStack Query for data fetching

**Backend:**
- Node.js with Express
- PostgreSQL for data persistence
- Socket.io for real-time multiplayer (optional)

**Smart Contracts:**
- Rust with Soroban SDK 23.0.2
- OpenZeppelin Stellar Contracts v0.5.1
- Scaffold Stellar for deployment

**Blockchain:**
- Stellar Network (Testnet/Mainnet)
- Soroban for smart contract execution
- IPFS for metadata storage

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ and npm
- **Rust** 1.70+ and Cargo
- **PostgreSQL** 14+ (optional, backend can run in mock mode)
- **Stellar CLI** (for contract deployment)
- **Scaffold Stellar CLI** (recommended)

### Step 1: Clone Repository

```bash
git clone https://github.com/your-username/space-stellar.git
cd space-stellar
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 3: Install Rust Dependencies

```bash
# Install Rust toolchain (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm32 target for contract compilation
rustup target add wasm32-unknown-unknown
```

### Step 4: Install Scaffold Stellar CLI (Recommended)

```bash
cargo install --locked stellar-scaffold-cli
```

### Step 5: Environment Configuration

Create environment files:

**Frontend (`frontend/.env`):**
```env
VITE_STELLAR_NETWORK=testnet
VITE_CONTRACT_ID=your_contract_id_here
VITE_PFP_CONTRACT_ID=your_pfp_contract_id_here
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

**Backend (`backend/.env`):**
```env
PORT=3001
NODE_ENV=development
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-rpc.testnet.stellar.org
HORIZON_URL=https://horizon-testnet.stellar.org

# Contract IDs (fill after deployment)
CONTRACT_ID=your_nft_contract_id
PFP_CONTRACT_ID=your_pfp_contract_id

# Database (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/space_stellar

# JWT Secret
JWT_SECRET=your_random_jwt_secret_key_here

# IPFS (if using Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
```

### Step 6: Build Smart Contracts

```bash
# Build all contracts
npm run deploy:build

# Or build individually
cd contracts/space_stellar_nft
cargo build --target wasm32-unknown-unknown --release
cd ../space_stellar_pfp
cargo build --target wasm32-unknown-unknown --release
cd ../..
```

### Step 7: Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Scaffold Stellar (Optional):**
```bash
npm run dev
# This watches for contract changes and rebuilds clients
```

Open your browser at `http://localhost:5173`

---

## 📝 Smart Contracts

### Contract 1: Space Stellar NFT (`space_stellar_nft`)

The main NFT contract for ship tokens with custom metadata.

**Contract Details:**
- **Name**: Space Stellar Ships
- **Symbol**: SSHIP
- **Standard**: OpenZeppelin NonFungibleToken (ERC-721 compatible)
- **Features**: Ownable, Sequential Minting, Custom Metadata

**Key Functions:**

```rust
// Constructor - Initialize contract
pub fn __constructor(e: &Env, owner: Address)

// Mint a new NFT ship with metadata
pub fn mint(
    e: &Env,
    to: Address,
    class: String,        // Ship class name
    rarity: String,       // Rarity level
    tier: String,         // Tier level
    attack: u32,          // Attack stat
    speed: u32,           // Speed stat
    shield: u32,          // Shield stat
    ipfs_cid: String,     // IPFS content ID
    metadata_uri: String  // Full metadata URI
) -> u32                  // Returns token ID

// Get ship metadata
pub fn get_ship_class(e: &Env, token_id: u32) -> Option<String>
pub fn get_ship_rarity(e: &Env, token_id: u32) -> Option<String>
pub fn get_ship_tier(e: &Env, token_id: u32) -> Option<String>
pub fn get_ipfs_cid(e: &Env, token_id: u32) -> Option<String>
pub fn get_metadata_uri(e: &Env, token_id: u32) -> Option<String>
```

**Metadata Storage:**
- Ship attributes stored on-chain using instance storage
- IPFS CID for off-chain metadata JSON
- Full metadata URI for external access

**OpenZeppelin Traits:**
- `NonFungibleToken`: Standard NFT operations (transfer, approve, etc.)
- `Ownable`: Contract ownership management

### Contract 2: Space Stellar PFP (`space_stellar_pfp`)

Profile Picture NFT contract - one PFP per address.

**Contract Details:**
- **Name**: Space Stellar PFP
- **Symbol**: SSPFP
- **Standard**: OpenZeppelin NonFungibleToken
- **Features**: One-per-address minting, Sequential IDs

**Key Functions:**

```rust
// Constructor - Initialize PFP contract
pub fn __constructor(e: &Env, owner: Address)

// Mint a PFP NFT (one per address)
pub fn mint(e: &Env, to: Address) -> u32  // Returns token ID

// Check if address has PFP
pub fn has_pfp(e: &Env, owner: Address) -> bool
```

**Minting Rules:**
- Each address can only mint one PFP
- Public minting (anyone can call)
- Sequential token IDs (1, 2, 3, ...)

### Deployment

#### Using Scaffold Stellar (Recommended)

**1. Publish Contract to Registry:**

```bash
# NFT Contract
stellar registry publish \
  --wasm target/wasm32-unknown-unknown/release/space_stellar_nft.wasm \
  --wasm-name space-stellar-nft

# PFP Contract
stellar registry publish \
  --wasm target/wasm32-unknown-unknown/release/space_stellar_pfp.wasm \
  --wasm-name space-stellar-pfp
```

**2. Deploy Contract Instances:**

```bash
# Deploy NFT Contract
stellar registry deploy \
  --contract-name space-stellar-nft-instance \
  --wasm-name space-stellar-nft \
  -- \
  --owner YOUR_OWNER_ADDRESS

# Deploy PFP Contract
stellar registry deploy \
  --contract-name space-stellar-pfp-instance \
  --wasm-name space-stellar-pfp \
  -- \
  --owner YOUR_OWNER_ADDRESS
```

**3. Create Aliases:**

```bash
stellar registry create-alias space-stellar-nft-instance
stellar registry create-alias space-stellar-pfp-instance
```

#### Manual Deployment

```bash
# Deploy using Stellar CLI
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/space_stellar_nft.wasm \
  --source-account YOUR_SECRET_KEY \
  --network testnet

# Initialize contract
stellar contract invoke \
  --id CONTRACT_ID \
  -- \
  __constructor \
  --owner YOUR_OWNER_ADDRESS
```

### Contract Verification

```bash
# Check contract metadata
stellar contract invoke --id space-stellar-nft-instance -- name
stellar contract invoke --id space-stellar-nft-instance -- symbol

# Test mint
stellar contract invoke \
  --id space-stellar-nft-instance \
  -- \
  mint \
  --to RECIPIENT_ADDRESS \
  --class "Elite" \
  --rarity "Common" \
  --tier "Tier 1" \
  --attack 10 \
  --speed 8 \
  --shield 12 \
  --ipfs_cid "QmExample..." \
  --metadata_uri "https://ipfs.io/ipfs/QmExample..."
```

---

## 🎮 Game Mechanics

### Ship Tiers

| Tier | Rarity | Price (XLM) | Attack | Speed | Shield | Total Stats |
|------|--------|-------------|--------|-------|--------|-------------|
| Classic | Default | Free | 5 | 5 | 5 | 15 |
| Elite | Common | 10 | 10 | 8 | 12 | 30 |
| Epic | Epic | 50 | 20 | 6 | 18 | 44 |
| Legendary | Legendary | 100 | 30 | 15 | 25 | 70 |
| Master | Master | 200 | 40 | 12 | 35 | 87 |
| Ultra | Ultra | 500 | 50 | 18 | 45 | 113 |

### Game Stats Impact

Ship stats affect gameplay:

- **Speed**: Movement velocity (pixels per frame)
- **Fire Rate**: Bullet firing interval (milliseconds)
- **Health**: Hit points before game over

**Rarity-based Stats:**
- Classic: Speed 5, Fire Rate 300ms, Health 3
- Common/Elite: Speed 6, Fire Rate 250ms, Health 4
- Epic: Speed 7, Fire Rate 200ms, Health 5
- Legendary: Speed 8, Fire Rate 150ms, Health 6
- Master: Speed 9, Fire Rate 120ms, Health 7
- Ultra: Speed 10, Fire Rate 100ms, Health 8

### Controls

- **Movement**: `WASD` or `Arrow Keys`
- **Shoot**: `Space`
- **Pause**: `P`

### Scoring System

- Enemy destroyed: +10 points
- Coin collected: +5 points
- Difficulty scaling: Enemy speed increases with score

---

## 🔌 API Documentation

### Backend API Endpoints

#### Rooms API

```typescript
// Create a new game room
POST /api/rooms/create
Body: {
  hostAddress: string
  mode: 'solo' | 'versus' | 'multiplayer'
  seed?: number
}
Response: {
  roomCode: string
  roomId: string
  status: 'waiting' | 'playing' | 'finished'
}

// Get room data
GET /api/rooms/:roomCode
Response: {
  roomId: string
  hostAddress: string
  guestAddress?: string
  mode: string
  status: string
  seed: number
  created_at: string
}

// Start room game
POST /api/rooms/:roomCode/start
Response: {
  success: boolean
  status: 'playing'
}

// Finish room game
POST /api/rooms/:roomCode/finish
Body: {
  finalScore?: number
  duration?: number
}
Response: {
  success: boolean
  status: 'finished'
}
```

#### Matches API

```typescript
// Save match result
POST /api/matches/save
Body: {
  mode: string
  p1_address: string
  p2_address?: string
  p1_score: number
  p2_score?: number
  duration_ms: number
  room_code: string
}
Response: {
  matchId: string
  success: boolean
}

// Get match history
GET /api/matches/history/:address
Response: {
  matches: Array<{
    match_id: string
    mode: string
    p1_address: string
    p2_address?: string
    p1_score: number
    p2_score?: number
    duration_ms: number
    room_code: string
    created_at: string
  }>
}

// Get leaderboard
GET /api/matches/leaderboard
Query: ?limit=10
Response: {
  leaderboard: Array<{
    address: string
    best_score: number
    updated_at: string
  }>
}
```

#### NFT API

```typescript
// Get user's NFTs
GET /api/nfts/:address
Response: {
  nfts: Array<{
    token_id: number
    owner_address: string
    ipfs_cid: string
    class: string
    rarity: string
    tier: string
    attack: number
    speed: number
    shield: number
  }>
}

// Mint NFT (requires payment)
POST /api/nfts/mint
Body: {
  address: string
  tier: string
  paymentTxHash: string
}
Response: {
  tokenId: number
  success: boolean
}
```

---

## 🛠️ Development

### Project Scripts

```bash
# Development
npm run dev              # Run frontend + scaffold watch
npm start                # Same as dev

# Building
npm run build            # Build frontend + contracts
npm run deploy:build     # Build contracts only

# Contract Deployment
npm run deploy:testnet   # Deploy to testnet
npm run deploy:mainnet   # Deploy to mainnet

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
```

### Contract Development

```bash
# Build contract
cd contracts/space_stellar_nft
cargo build --target wasm32-unknown-unknown --release

# Test contract
cargo test

# Check contract size
ls -lh target/wasm32-unknown-unknown/release/space_stellar_nft.wasm
```

### Frontend Development

```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development

```bash
cd backend

# Development server with hot reload
npm run dev

# Production build
npm run build
npm start
```

---

## 📚 Documentation

### Additional Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Scaffold Stellar](https://scaffoldstellar.org/)
- [Stellar Wallet Kit](https://github.com/stellar/wallet-kit)
- [OpenZeppelin Stellar Contracts](https://github.com/OpenZeppelin/stellar-contracts)

### Project Documentation Files

- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- `GAME_FEATURES_COMPLETE.md` - Complete game features list
- `TIER_SYSTEM.md` - Ship tier system documentation
- `MULTIPLAYER_IMPLEMENTATION.md` - Multiplayer architecture
- `SMART_CONTRACT_MINTING.md` - Minting flow documentation

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Code Style

- Follow TypeScript/JavaScript best practices
- Use ESLint and Prettier configurations
- Write meaningful commit messages
- Add tests for new features

### Contract Contributions

- Follow Rust best practices
- Ensure contracts are optimized for size
- Add comprehensive tests
- Document all public functions

---

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Stellar Development Foundation** for the amazing blockchain platform
- **OpenZeppelin** for the Stellar smart contract standards
- **Scaffold Stellar** team for the excellent development framework
- All contributors and community members

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/space-stellar/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/space-stellar/discussions)
- **Email**: support@spacestellar.app

---

<div align="center">

**Built with ❤️ on Stellar**

[Website](https://spacestellar.app) • [Documentation](https://docs.spacestellar.app) • [Twitter](https://twitter.com/spacestellar)

</div>
