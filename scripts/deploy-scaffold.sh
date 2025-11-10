#!/bin/bash

# Space Stellar NFT - Deployment Script
# Mengikuti dokumentasi Scaffold Stellar: https://scaffoldstellar.org/docs/quick-start

set -e

echo "🚀 Space Stellar NFT - Contract Deployment"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if WASM file exists
WASM_PATH="target/stellar/space_stellar_nft.wasm"

if [ ! -f "$WASM_PATH" ]; then
    echo -e "${YELLOW}⚠️  WASM file not found. Building contract...${NC}"
    echo ""
    stellar scaffold build
    echo ""
fi

if [ ! -f "$WASM_PATH" ]; then
    echo -e "${RED}❌ Error: WASM file not found at $WASM_PATH${NC}"
    echo "Please build the contract first: stellar scaffold build"
    exit 1
fi

echo -e "${GREEN}✅ WASM file found: $WASM_PATH${NC}"
echo ""

# Get network (default: testnet)
NETWORK=${1:-testnet}
echo -e "${YELLOW}📡 Network: $NETWORK${NC}"
echo ""

# Get owner address
if [ -z "$OWNER_ADDRESS" ]; then
    echo "Enter owner address (or press Enter to use 'me' account):"
    read OWNER_INPUT
    if [ -z "$OWNER_INPUT" ]; then
        OWNER_ADDRESS=$(stellar keys address me 2>/dev/null || echo "")
        if [ -z "$OWNER_ADDRESS" ]; then
            echo -e "${RED}❌ Error: Could not get address for 'me' account${NC}"
            echo "Please set OWNER_ADDRESS environment variable or create 'me' account"
            exit 1
        fi
    else
        OWNER_ADDRESS=$OWNER_INPUT
    fi
fi

echo -e "${GREEN}👤 Owner Address: $OWNER_ADDRESS${NC}"
echo ""

# Step 1: Publish to Registry
echo -e "${YELLOW}📦 Step 1: Publishing contract to registry...${NC}"
echo ""

if [ "$NETWORK" = "testnet" ] || [ "$NETWORK" = "mainnet" ]; then
    stellar registry publish \
        --wasm "$WASM_PATH" \
        --wasm-name space-stellar-nft \
        --network "$NETWORK"
else
    stellar registry publish \
        --wasm "$WASM_PATH" \
        --wasm-name space-stellar-nft
fi

echo ""
echo -e "${GREEN}✅ Contract published to registry${NC}"
echo ""

# Step 2: Deploy Instance
echo -e "${YELLOW}🚀 Step 2: Deploying contract instance...${NC}"
echo ""

if [ "$NETWORK" = "testnet" ] || [ "$NETWORK" = "mainnet" ]; then
    stellar registry deploy \
        --contract-name space-stellar-nft-instance \
        --wasm-name space-stellar-nft \
        --network "$NETWORK" \
        -- \
        --owner "$OWNER_ADDRESS"
else
    stellar registry deploy \
        --contract-name space-stellar-nft-instance \
        --wasm-name space-stellar-nft \
        -- \
        --owner "$OWNER_ADDRESS"
fi

echo ""
echo -e "${GREEN}✅ Contract instance deployed${NC}"
echo ""

# Step 3: Create Alias
echo -e "${YELLOW}🔗 Step 3: Creating local alias...${NC}"
echo ""

stellar registry create-alias space-stellar-nft-instance

echo ""
echo -e "${GREEN}✅ Alias created: space-stellar-nft-instance${NC}"
echo ""

# Step 4: Get Contract ID
echo -e "${YELLOW}📝 Step 4: Getting contract ID...${NC}"
echo ""

CONTRACT_ID=$(stellar contract invoke --id space-stellar-nft-instance -- --help 2>&1 | grep -i "contract id" | head -1 | awk '{print $NF}' || echo "")

if [ -z "$CONTRACT_ID" ]; then
    # Try alternative method
    CONTRACT_ID=$(stellar keys lookup space-stellar-nft-instance 2>/dev/null || echo "")
fi

if [ -n "$CONTRACT_ID" ]; then
    echo -e "${GREEN}✅ Contract ID: $CONTRACT_ID${NC}"
    echo ""
    echo "📋 Update environments.toml dengan Contract ID ini:"
    echo ""
    echo "[${NETWORK}.contracts.space_stellar_nft]"
    echo "client = true"
    echo "id = \"$CONTRACT_ID\""
    echo ""
else
    echo -e "${YELLOW}⚠️  Could not automatically get Contract ID${NC}"
    echo "Please check manually: stellar contract invoke --id space-stellar-nft-instance -- --help"
    echo ""
fi

# Step 5: Verify
echo -e "${YELLOW}✅ Step 5: Verifying deployment...${NC}"
echo ""

echo "Test contract functions:"
echo "  stellar contract invoke --id space-stellar-nft-instance -- --help"
echo ""

echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Update environments.toml with Contract ID"
echo "2. Update .env files with Contract ID"
echo "3. Test contract functions"
echo ""




