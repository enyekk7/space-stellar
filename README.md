# 🚀 Space Stellar

<div align="center">

**A Next-Generation NFT-Based Space Shooter Game on Stellar Blockchain**

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Stellar](https://img.shields.io/badge/Stellar-Testnet-orange.svg)](https://www.stellar.org/)
[![Soroban](https://img.shields.io/badge/Soroban-Smart%20Contracts-purple.svg)](https://soroban.stellar.org/)
[![Scaffold Stellar](https://img.shields.io/badge/Scaffold%20Stellar-Registry-green.svg)](https://scaffoldstellar.org/docs/registry)
[![React](https://img.shields.io/badge/React-19.1.1-61DAFB.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6.svg)](https://www.typescriptlang.org/)

[Features](#-features) • [Installation](#-installation) • [Smart Contracts](#-smart-contracts) • [Deployment](#-deployment) • [Documentation](#-documentation)

</div>

---

## 📖 Apa Itu Space Stellar?

**Space Stellar** adalah game web3 terdesentralisasi yang dibangun di atas blockchain Stellar, menggabungkan koleksi NFT dengan gameplay space shooter real-time. Project ini menggunakan [Scaffold Stellar Registry](https://scaffoldstellar.org/docs/registry) untuk mengelola dan mendeploy smart contracts dengan mudah.

### 🎯 Konsep Project

Space Stellar adalah **Play-to-Earn NFT Game** di mana:

1. **Pemain mengumpulkan NFT Ships** - Setiap ship adalah NFT unik dengan atribut berbeda (Attack, Speed, Shield)
2. **Bermain game space shooter** - Gunakan NFT ships untuk bermain game real-time
3. **Kompetisi global** - Naikkan ranking di leaderboard dan dapatkan rewards
4. **Multiplayer support** - Bermain solo atau versus dengan pemain lain

### 🏗️ Arsitektur Teknologi

Project ini menggunakan **Scaffold Stellar Registry System** untuk deployment smart contracts:

- **Registry Contract**: Kontrak on-chain untuk publish, deploy, dan manage smart contracts
- **Registry CLI**: Tool untuk berinteraksi dengan registry (`stellar registry` commands)
- **OpenZeppelin Standards**: Menggunakan OpenZeppelin Stellar Contracts untuk standar NFT
- **Soroban Smart Contracts**: Smart contracts ditulis dalam Rust menggunakan Soroban SDK

### 🔑 Mengapa Menggunakan Scaffold Stellar Registry?

1. **Simplified Deployment**: Tidak perlu manage contract IDs secara manual
2. **Version Management**: Registry menyimpan semua versi contract yang dipublish
3. **Easy Updates**: Update contract dengan mudah tanpa kehilangan data
4. **Alias System**: Gunakan nama alias untuk memudahkan development
5. **On-chain Registry**: Semua contract terdaftar di blockchain untuk transparansi

**Dokumentasi Lengkap**: [Scaffold Stellar Registry Guide](https://scaffoldstellar.org/docs/registry)

---

## ✨ Features

### 🎮 Game Features

- **Space Shooter Mechanics**
  - Player ship movement (WASD/Arrow Keys)
  - Shooting system dengan fire rate yang bisa disesuaikan
  - Enemy spawning dengan difficulty scaling
  - Collision detection dan health system
  - Score tracking dan coin collection
  - Power-ups dan special abilities

- **Game Modes**
  - **Solo Mode**: Single-player gameplay dengan global leaderboard
  - **Multiplayer Mode**: Room-based versus matches dengan real-time synchronization

- **Ship System**
  - 6-tier rarity system (Classic, Elite, Epic, Legendary, Master, Ultra)
  - Unique stats per tier (Attack, Speed, Shield)
  - Dynamic ship attributes yang mempengaruhi gameplay
  - Visual ship representation dengan GIF animations

### 🎨 NFT Features

- **NFT Minting**
  - Mint unique ship NFTs langsung dari store
  - IPFS-based metadata storage
  - On-chain attribute storage (class, rarity, tier, stats)
  - Sequential token ID assignment

- **Collection Management**
  - View owned NFTs di collection page
  - Ship equipping system
  - Profile picture (PFP) NFT support
  - Transfer dan ownership tracking

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
  - User profile dengan statistics
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
│   ├── routes/             # API routes
│   ├── scripts/            # Migration & utility scripts
│   ├── utils/              # Utility functions
│   └── server.js           # Express server
│
├── contracts/               # Soroban smart contracts (Rust)
│   ├── space_stellar_nft/  # Main NFT contract (Ships)
│   │   ├── src/lib.rs      # Contract implementation
│   │   └── Cargo.toml
│   ├── space_stellar_pfp/  # Profile Picture NFT contract
│   │   ├── src/lib.rs      # PFP contract implementation
│   │   └── Cargo.toml
│   └── Cargo.toml          # Workspace configuration
│
├── scripts/                # Deployment scripts
├── scaffold.config.js      # Scaffold Stellar configuration
└── package.json            # Root package.json
```

### Technology Stack

**Frontend:**
- React 19.1.1 with TypeScript
- Vite 7.1.11 untuk build tooling
- Stellar Wallet Kit untuk wallet integration
- React Router untuk navigation
- TanStack Query untuk data fetching

**Backend:**
- Node.js dengan Express
- PostgreSQL untuk data persistence (optional)
- Socket.io untuk real-time multiplayer

**Smart Contracts:**
- Rust dengan Soroban SDK 23.0.2
- OpenZeppelin Stellar Contracts v0.5.1
- **Scaffold Stellar Registry** untuk deployment dan management

**Blockchain:**
- Stellar Network (Testnet/Mainnet)
- Soroban untuk smart contract execution
- IPFS untuk metadata storage

---

## 🚀 Installation

### Prerequisites

- **Node.js** 18+ dan npm
- **Rust** 1.70+ dan Cargo
- **PostgreSQL** 14+ (optional, backend bisa run di mock mode)
- **Stellar CLI** - untuk contract deployment
- **Scaffold Stellar CLI** - untuk registry management

### Step 1: Clone Repository

```bash
git clone https://github.com/enyekk7/space-stellar.git
cd space-stellar
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend && npm install && cd ..

# Install backend dependencies
cd backend && npm install && cd ..
```

### Step 3: Install Rust & Build Tools

```bash
# Install Rust toolchain (jika belum terinstall)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install wasm32 target untuk contract compilation
rustup target add wasm32-unknown-unknown
```

### Step 4: Install Scaffold Stellar CLI

```bash
# Install Scaffold Stellar CLI
cargo install --locked stellar-scaffold-cli

# Install Registry CLI (untuk registry management)
cargo install --git https://github.com/theahaco/scaffold-stellar stellar-registry-cli
```

**Referensi**: [Scaffold Stellar Registry Installation](https://scaffoldstellar.org/docs/registry#prerequisites)

### Step 5: Environment Configuration

Buat file environment:

**Frontend (`frontend/.env`):**
```env
VITE_STELLAR_NETWORK=testnet
VITE_CONTRACT_ID=your_nft_contract_id_here
VITE_PFP_CONTRACT_ID=your_pfp_contract_id_here
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
VITE_TREASURY_ADDRESS=your_treasury_address_here
```

**Backend (`backend/.env`):**
```env
PORT=3001
NODE_ENV=development
STELLAR_NETWORK=testnet
SOROBAN_RPC_URL=https://soroban-rpc.testnet.stellar.org
HORIZON_URL=https://horizon-testnet.stellar.org

# Contract IDs (isi setelah deployment)
CONTRACT_ID=your_nft_contract_id
PFP_CONTRACT_ID=your_pfp_contract_id

# Database (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/space_stellar

# JWT Secret
JWT_SECRET=your_random_jwt_secret_key_here

# IPFS (jika menggunakan Pinata)
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# Contract Owner (untuk PFP minting)
PFP_CONTRACT_OWNER_SECRET=your_owner_secret_key_here
```

### Step 6: Build Smart Contracts

```bash
# Build semua contracts
npm run deploy:build

# Atau build secara individual
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

**Terminal 3 - Scaffold Stellar Watch (Optional):**
```bash
npm run dev
# Ini akan watch perubahan contract dan rebuild clients
```

Buka browser di `http://localhost:5173`

---

## 📝 Smart Contracts

Project ini menggunakan **2 smart contracts** yang di-deploy menggunakan **Scaffold Stellar Registry**:

### 🚀 Contract 1: Space Stellar NFT (`space_stellar_nft`)

**Kontrak NFT utama untuk ship tokens dengan custom metadata.**

#### Detail Kontrak

- **Name**: Space Stellar Ships
- **Symbol**: SSHIP
- **Standard**: OpenZeppelin NonFungibleToken (ERC-721 compatible)
- **Features**: Ownable, Sequential Minting, Custom Metadata
- **Deployment**: Menggunakan Scaffold Stellar Registry

#### Cara Kerja Kontrak NFT Pesawat

1. **Initialization (Constructor)**
   ```rust
   pub fn __constructor(e: &Env, owner: Address)
   ```
   - Set contract metadata (name, symbol, URI)
   - Set contract owner
   - Initialize OpenZeppelin base contract

2. **Minting Process**
   ```rust
   pub fn mint(
       e: &Env,
       to: Address,
       class: String,        // Ship class (Elite, Epic, etc.)
       rarity: String,       // Rarity level
       tier: String,         // Tier level
       attack: u32,          // Attack stat
       speed: u32,           // Speed stat
       shield: u32,          // Shield stat
       ipfs_cid: String,     // IPFS content ID
       metadata_uri: String  // Full metadata URI
   ) -> u32                  // Returns token ID
   ```
   
   **Flow Minting:**
   1. User memilih tier ship di Store page
   2. Frontend membuat payment transaction ke Treasury address
   3. Setelah payment confirmed, frontend memanggil `mint()` function
   4. Contract menggunakan `Base::sequential_mint()` untuk mint NFT
   5. Metadata disimpan on-chain (class, rarity, tier, stats, IPFS CID)
   6. Token ID dikembalikan dan ditampilkan ke user

3. **Metadata Storage**
   - Ship attributes disimpan on-chain menggunakan instance storage
   - IPFS CID untuk off-chain metadata JSON
   - Full metadata URI untuk external access

4. **OpenZeppelin Traits**
   - `NonFungibleToken`: Standard NFT operations (transfer, approve, etc.)
   - `Ownable`: Contract ownership management

#### Fungsi Utama

```rust
// Get ship metadata
pub fn get_ship_class(e: &Env, token_id: u32) -> Option<String>
pub fn get_ship_rarity(e: &Env, token_id: u32) -> Option<String>
pub fn get_ship_tier(e: &Env, token_id: u32) -> Option<String>
pub fn get_ipfs_cid(e: &Env, token_id: u32) -> Option<String>
pub fn get_metadata_uri(e: &Env, token_id: u32) -> Option<String>
```

### 🎨 Contract 2: Space Stellar PFP (`space_stellar_pfp`)

**Kontrak NFT untuk Profile Picture - satu PFP per address.**

#### Detail Kontrak

- **Name**: Space Stellar PFP
- **Symbol**: SSPFP
- **Standard**: OpenZeppelin NonFungibleToken
- **Features**: One-per-address minting, Sequential IDs
- **Deployment**: Menggunakan Scaffold Stellar Registry

#### Cara Kerja Kontrak PFP

1. **Initialization**
   ```rust
   pub fn __constructor(e: &Env, owner: Address)
   ```
   - Set contract metadata
   - Set contract owner

2. **Minting Process**
   ```rust
   pub fn mint(e: &Env, to: Address) -> u32
   ```
   
   **Flow Minting:**
   1. User memilih PFP di Profile page
   2. Frontend/Backend memanggil `mint()` function
   3. Contract mengecek apakah address sudah punya PFP (`balance > 0`)
   4. Jika belum punya, contract mint PFP menggunakan `Base::sequential_mint()`
   5. Token ID dikembalikan

3. **Minting Rules**
   - Setiap address hanya bisa mint **satu PFP**
   - Public minting (siapa saja bisa call)
   - Sequential token IDs (1, 2, 3, ...)

4. **Check Function**
   ```rust
   pub fn has_pfp(e: &Env, owner: Address) -> bool
   ```
   - Mengecek apakah address sudah memiliki PFP
   - Menggunakan `Base::balance()` untuk pengecekan

---

## 🚀 Deployment dengan Scaffold Stellar Registry

Project ini menggunakan [Scaffold Stellar Registry](https://scaffoldstellar.org/docs/registry) untuk deployment smart contracts. Registry system memudahkan publish, deploy, dan manage contracts.

### Prerequisites untuk Deployment

1. **Install Registry CLI:**
   ```bash
   cargo install --git https://github.com/theahaco/scaffold-stellar stellar-registry-cli
   ```

2. **Setup Stellar Account:**
   ```bash
   stellar keys use alice
   stellar network use testnet
   ```

3. **Fund Account:**
   - Testnet: Gunakan [Friendbot](https://laboratory.stellar.org/#account-creator)
   - Mainnet: Transfer XLM ke account

### Registry Contract Addresses

Registry contract sudah di-deploy di setiap network:

- **Testnet**: `CBCOGWBDGBFWR5LQFKRQUPFIG6OLOON35PBKUPB6C542DFZI3OMBOGHX`
- **Mainnet**: `CC3SILHAJ5O75KMSJ5J6I5HV753OTPWEVMZUYHS4QEM2ZTISQRAOMMF4`
- **Futurenet**: `CACPZCQSLEGF6QOSBF42X6LOUQXQB2EJRDKNKQO6US6ZZH5FD6EB325M`

### Deployment Workflow

#### 1. Build Contracts

```bash
# Build NFT contract
cd contracts/space_stellar_nft
cargo build --target wasm32-unknown-unknown --release

# Build PFP contract
cd ../space_stellar_pfp
cargo build --target wasm32-unknown-unknown --release
cd ../..
```

#### 2. Publish Contracts ke Registry

**Publish NFT Contract:**
```bash
stellar registry publish \
  --wasm target/wasm32-unknown-unknown/release/space_stellar_nft.wasm \
  --wasm-name space-stellar-nft \
  --binver "1.0.0" \
  --network testnet
```

**Publish PFP Contract:**
```bash
stellar registry publish \
  --wasm target/wasm32-unknown-unknown/release/space_stellar_pfp.wasm \
  --wasm-name space-stellar-pfp \
  --binver "1.0.0" \
  --network testnet
```

**Penjelasan:**
- `--wasm`: Path ke compiled WASM file
- `--wasm-name`: Nama untuk published contract (akan digunakan untuk deploy)
- `--binver`: Versi binary (mengikuti semantic versioning)
- `--network`: Network target (testnet/mainnet)

#### 3. Deploy Contract Instances

**Deploy NFT Contract:**
```bash
stellar registry deploy \
  --contract-name space-stellar-nft-instance \
  --wasm-name space-stellar-nft \
  --version "1.0.0" \
  --network testnet \
  -- \
  __constructor \
  --owner YOUR_OWNER_ADDRESS
```

**Deploy PFP Contract:**
```bash
stellar registry deploy \
  --contract-name space-stellar-pfp-instance \
  --wasm-name space-stellar-pfp \
  --version "1.0.0" \
  --network testnet \
  -- \
  __constructor \
  --owner YOUR_OWNER_ADDRESS
```

**Penjelasan:**
- `--contract-name`: Nama untuk deployed contract instance
- `--wasm-name`: Nama published contract yang akan di-deploy
- `--version`: Versi specific (optional, default: latest)
- `--`: Separator untuk constructor function dan arguments
- `__constructor`: Constructor function name
- `--owner`: Owner address untuk contract

#### 4. Create Aliases (Optional)

Alias memudahkan penggunaan contract dengan nama yang mudah diingat:

```bash
# Create alias untuk NFT contract
stellar registry create-alias space-stellar-nft-instance

# Create alias untuk PFP contract
stellar registry create-alias space-stellar-pfp-instance
```

Setelah create alias, bisa langsung pakai:
```bash
stellar contract invoke --id space-stellar-nft-instance -- --help
```

#### 5. Get Contract IDs

Setelah deploy, dapatkan Contract ID:

```bash
# Get Contract ID dari alias
stellar keys lookup space-stellar-nft-instance

# Atau dari registry
stellar registry info space-stellar-nft-instance
```

Update Contract IDs di environment files:
- `frontend/.env`: `VITE_CONTRACT_ID` dan `VITE_PFP_CONTRACT_ID`
- `backend/.env`: `CONTRACT_ID` dan `PFP_CONTRACT_ID`

### Menggunakan Deployment Scripts

Project ini menyediakan deployment scripts:

**PowerShell (Windows):**
```powershell
.\scripts\deploy-scaffold.ps1 -Network testnet
```

**Bash (Linux/Mac):**
```bash
./scripts/deploy-scaffold.sh testnet
```

### Verifikasi Deployment

```bash
# Check contract metadata
stellar contract invoke --id space-stellar-nft-instance -- name
stellar contract invoke --id space-stellar-nft-instance -- symbol

# Test mint NFT
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
  --metadata_uri "ipfs://QmExample..."

# Test mint PFP
stellar contract invoke \
  --id space-stellar-pfp-instance \
  -- \
  mint \
  --to RECIPIENT_ADDRESS
```

### Best Practices

1. **Semantic Versioning**: Gunakan semantic versioning untuk contract versions
2. **Test di Testnet**: Selalu test deployment di testnet sebelum mainnet
3. **Dry Run**: Gunakan `--dry-run` flag untuk simulate operations
4. **Documentation**: Dokumentasikan initialization parameters untuk setiap deployment
5. **Environment Variables**: Gunakan environment variables untuk network configurations

**Referensi Lengkap**: [Scaffold Stellar Registry Guide](https://scaffoldstellar.org/docs/registry)

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

Ship stats mempengaruhi gameplay:

- **Speed**: Movement velocity (pixels per frame)
- **Fire Rate**: Bullet firing interval (milliseconds)
- **Health**: Hit points sebelum game over

**Rarity-based Stats:**
- Classic: Speed 5, Fire Rate 300ms, Health 3
- Common/Elite: Speed 6, Fire Rate 250ms, Health 4
- Epic: Speed 7, Fire Rate 200ms, Health 5
- Legendary: Speed 8, Fire Rate 150ms, Health 6
- Master: Speed 9, Fire Rate 120ms, Health 7
- Ultra: Speed 10, Fire Rate 100ms, Health 8

### Controls

- **Movement**: `WASD` atau `Arrow Keys`
- **Shoot**: `Space`
- **Pause**: `P`

### Scoring System

- Enemy destroyed: +10 points
- Coin collected: +5 points
- Difficulty scaling: Enemy speed increases dengan score

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

---

## 📚 Documentation

### Additional Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [Scaffold Stellar](https://scaffoldstellar.org/)
- **[Scaffold Stellar Registry Guide](https://scaffoldstellar.org/docs/registry)** ⭐
- [Stellar Wallet Kit](https://github.com/stellar/wallet-kit)
- [OpenZeppelin Stellar Contracts](https://github.com/OpenZeppelin/stellar-contracts)

### Project Documentation

- `contracts/README.md` - Detailed smart contracts documentation
- `GIT_FILTER.md` - Git filter documentation

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

- **Stellar Development Foundation** untuk blockchain platform yang luar biasa
- **OpenZeppelin** untuk Stellar smart contract standards
- **Scaffold Stellar** team untuk development framework dan registry system
- All contributors dan community members

---

## 📞 Support

- **Repository**: [GitHub](https://github.com/enyekk7/space-stellar)
- **Issues**: [GitHub Issues](https://github.com/enyekk7/space-stellar/issues)
- **Discussions**: [GitHub Discussions](https://github.com/enyekk7/space-stellar/discussions)

---

<div align="center">

**Built with ❤️ on Stellar using Scaffold Stellar Registry**

[Website](https://spacestellar.app) • [Documentation](https://docs.spacestellar.app)

</div>
