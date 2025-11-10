# Script untuk Initialize PFP Contract
# Error "UnreachableCodeReached" terjadi karena contract belum di-initialize

$PFP_CONTRACT_ID = "CA3SVWTJNPRSYLG2TIHTC663T5IUCOTL3NGRDXCREMS2OHNH3TW2Q4K4"
$OWNER_ADDRESS = "GANJV3X43ARMZ2UWDYM6E7ZWMIFXLYQLJO5TXJX76OJGFCHKYSUG6VZP"
$NETWORK = "testnet"

Write-Host "🚀 Initializing PFP Contract..." -ForegroundColor Cyan
Write-Host "Contract ID: $PFP_CONTRACT_ID" -ForegroundColor Yellow
Write-Host "Owner Address: $OWNER_ADDRESS" -ForegroundColor Yellow
Write-Host ""

# Initialize contract dengan constructor
Write-Host "📝 Calling __constructor..." -ForegroundColor Cyan
stellar contract invoke `
    --id $PFP_CONTRACT_ID `
    --source $NETWORK `
    --network $NETWORK `
    -- __constructor `
    --owner $OWNER_ADDRESS

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Contract initialized successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔍 Verifying contract..." -ForegroundColor Cyan
    
    # Verify dengan check name
    stellar contract invoke `
        --id $PFP_CONTRACT_ID `
        --source $NETWORK `
        --network $NETWORK `
        -- name
    
    Write-Host ""
    Write-Host "✅ Contract is ready to use!" -ForegroundColor Green
    Write-Host "You can now mint PFP NFTs!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "❌ Failed to initialize contract" -ForegroundColor Red
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Contract ID is correct" -ForegroundColor Yellow
    Write-Host "  2. Owner address is correct" -ForegroundColor Yellow
    Write-Host "  3. You have XLM in your account" -ForegroundColor Yellow
    Write-Host "  4. Network is correct (testnet/mainnet)" -ForegroundColor Yellow
}


