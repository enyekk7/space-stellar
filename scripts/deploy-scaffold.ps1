# Space Stellar NFT - Deployment Script (PowerShell)
# Mengikuti dokumentasi Scaffold Stellar: https://scaffoldstellar.org/docs/quick-start

param(
    [string]$Network = "testnet",
    [string]$OwnerAddress = ""
)

$ErrorActionPreference = "Stop"

Write-Host "Space Stellar NFT - Contract Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Check if WASM file exists (try multiple locations)
$WasmPath = "target\stellar\local\space_stellar_nft.wasm"
if (-not (Test-Path $WasmPath)) {
    $WasmPath = "target\stellar\space_stellar_nft.wasm"
}

if (-not (Test-Path $WasmPath)) {
    Write-Host "WASM file not found. Building contract..." -ForegroundColor Yellow
    Write-Host ""
    stellar scaffold build
    Write-Host ""
}

if (-not (Test-Path $WasmPath)) {
    Write-Host "Error: WASM file not found at $WasmPath" -ForegroundColor Red
    Write-Host "Please build the contract first: stellar scaffold build" -ForegroundColor Red
    exit 1
}

Write-Host "WASM file found: $WasmPath" -ForegroundColor Green
Write-Host ""

# Get network
Write-Host "Network: $Network" -ForegroundColor Yellow
Write-Host ""

# Get owner address
if ([string]::IsNullOrEmpty($OwnerAddress)) {
    $OwnerInput = Read-Host "Enter owner address (or press Enter to use 'me' account)"
    if ([string]::IsNullOrEmpty($OwnerInput)) {
        try {
            $OwnerAddress = (stellar keys address me 2>&1 | Out-String).Trim()
            if ([string]::IsNullOrEmpty($OwnerAddress)) {
                Write-Host "Error: Could not get address for 'me' account" -ForegroundColor Red
                Write-Host "Please set -OwnerAddress parameter or create 'me' account" -ForegroundColor Red
                exit 1
            }
        } catch {
            Write-Host "Error: Could not get address for 'me' account" -ForegroundColor Red
            Write-Host "Please set -OwnerAddress parameter" -ForegroundColor Red
            exit 1
        }
    } else {
        $OwnerAddress = $OwnerInput
    }
}

Write-Host "Owner Address: $OwnerAddress" -ForegroundColor Green
Write-Host ""

# Step 1: Publish to Registry
Write-Host "Step 1: Publishing contract to registry..." -ForegroundColor Yellow
Write-Host ""

if ($Network -eq "testnet" -or $Network -eq "mainnet") {
    stellar registry publish `
        --wasm $WasmPath `
        --wasm-name space-stellar-nft `
        --network $Network
} else {
    stellar registry publish `
        --wasm $WasmPath `
        --wasm-name space-stellar-nft
}

Write-Host ""
Write-Host "Contract published to registry" -ForegroundColor Green
Write-Host ""

# Step 2: Deploy Instance
Write-Host "Step 2: Deploying contract instance..." -ForegroundColor Yellow
Write-Host ""

if ($Network -eq "testnet" -or $Network -eq "mainnet") {
    stellar registry deploy `
        --contract-name space-stellar-nft-instance `
        --wasm-name space-stellar-nft `
        --network $Network `
        -- `
        --owner $OwnerAddress
} else {
    stellar registry deploy `
        --contract-name space-stellar-nft-instance `
        --wasm-name space-stellar-nft `
        -- `
        --owner $OwnerAddress
}

Write-Host ""
Write-Host "Contract instance deployed" -ForegroundColor Green
Write-Host ""

# Step 3: Create Alias
Write-Host "Step 3: Creating local alias..." -ForegroundColor Yellow
Write-Host ""

stellar registry create-alias space-stellar-nft-instance

Write-Host ""
Write-Host "Alias created: space-stellar-nft-instance" -ForegroundColor Green
Write-Host ""

# Step 4: Get Contract ID
Write-Host "Step 4: Getting contract ID..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Test contract functions:" -ForegroundColor Cyan
Write-Host "  stellar contract invoke --id space-stellar-nft-instance -- --help" -ForegroundColor Gray
Write-Host ""

Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update environments.toml with Contract ID" -ForegroundColor Gray
Write-Host "2. Update .env files with Contract ID" -ForegroundColor Gray
Write-Host "3. Test contract functions" -ForegroundColor Gray
Write-Host ""


