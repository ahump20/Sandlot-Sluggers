#!/bin/bash

# Sandlot Sluggers - Cloudflare Setup Script
# This script creates all required Cloudflare resources

set -e  # Exit on error

echo "🎮 Sandlot Sluggers - Cloudflare Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI not found${NC}"
    echo "Install with: npm install -g wrangler"
    exit 1
fi

echo -e "${GREEN}✓ Wrangler CLI found${NC}"
echo ""

# Check if logged in
echo "Checking Wrangler authentication..."
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠ Not logged in to Wrangler${NC}"
    echo "Running: wrangler login"
    wrangler login
else
    echo -e "${GREEN}✓ Already authenticated${NC}"
fi

echo ""
echo "================================"
echo "Creating Cloudflare Resources"
echo "================================"
echo ""

# 1. Create D1 Database (Production)
echo -e "${BLUE}1/7${NC} Creating D1 Database (Production)..."
if wrangler d1 list | grep -q "sandlot-sluggers-db"; then
    echo -e "${YELLOW}  ⚠ Database already exists${NC}"
    D1_PROD_ID=$(wrangler d1 list | grep "sandlot-sluggers-db" | awk '{print $2}')
else
    echo "  Creating sandlot-sluggers-db..."
    D1_OUTPUT=$(wrangler d1 create sandlot-sluggers-db)
    D1_PROD_ID=$(echo "$D1_OUTPUT" | grep "database_id" | cut -d'"' -f4)
    echo -e "${GREEN}  ✓ Created${NC}"
fi
echo "  Database ID: $D1_PROD_ID"
echo ""

# 2. Create D1 Database (Development)
echo -e "${BLUE}2/7${NC} Creating D1 Database (Development)..."
if wrangler d1 list | grep -q "sandlot-sluggers-db-dev"; then
    echo -e "${YELLOW}  ⚠ Database already exists${NC}"
    D1_DEV_ID=$(wrangler d1 list | grep "sandlot-sluggers-db-dev" | awk '{print $2}')
else
    echo "  Creating sandlot-sluggers-db-dev..."
    D1_OUTPUT=$(wrangler d1 create sandlot-sluggers-db-dev)
    D1_DEV_ID=$(echo "$D1_OUTPUT" | grep "database_id" | cut -d'"' -f4)
    echo -e "${GREEN}  ✓ Created${NC}"
fi
echo "  Database ID: $D1_DEV_ID"
echo ""

# 3. Initialize Database Schema (Production)
echo -e "${BLUE}3/7${NC} Initializing Database Schema (Production)..."
if [ -f "schema.sql" ]; then
    wrangler d1 execute sandlot-sluggers-db --file=./schema.sql --remote
    echo -e "${GREEN}  ✓ Schema applied${NC}"
else
    echo -e "${RED}  ❌ schema.sql not found${NC}"
fi
echo ""

# 4. Create KV Namespace (Production)
echo -e "${BLUE}4/7${NC} Creating KV Namespace (Production)..."
if wrangler kv:namespace list | grep -q "SLUGGERS_KV"; then
    echo -e "${YELLOW}  ⚠ KV namespace already exists${NC}"
    KV_PROD_ID=$(wrangler kv:namespace list | grep "SLUGGERS_KV" | grep -v "preview" | awk '{print $2}')
else
    echo "  Creating SLUGGERS_KV..."
    KV_OUTPUT=$(wrangler kv:namespace create "SLUGGERS_KV")
    KV_PROD_ID=$(echo "$KV_OUTPUT" | grep "id" | cut -d'"' -f4)
    echo -e "${GREEN}  ✓ Created${NC}"
fi
echo "  KV Namespace ID: $KV_PROD_ID"
echo ""

# 5. Create KV Namespace (Development)
echo -e "${BLUE}5/7${NC} Creating KV Namespace (Development/Preview)..."
if wrangler kv:namespace list | grep -q "SLUGGERS_KV.*preview"; then
    echo -e "${YELLOW}  ⚠ KV namespace already exists${NC}"
    KV_DEV_ID=$(wrangler kv:namespace list | grep "SLUGGERS_KV" | grep "preview" | awk '{print $2}')
else
    echo "  Creating SLUGGERS_KV (preview)..."
    KV_OUTPUT=$(wrangler kv:namespace create "SLUGGERS_KV" --preview)
    KV_DEV_ID=$(echo "$KV_OUTPUT" | grep "id" | cut -d'"' -f4)
    echo -e "${GREEN}  ✓ Created${NC}"
fi
echo "  KV Namespace ID: $KV_DEV_ID"
echo ""

# 6. Create R2 Bucket (Production)
echo -e "${BLUE}6/7${NC} Creating R2 Bucket (Production)..."
if wrangler r2 bucket list | grep -q "sandlot-sluggers-assets"; then
    echo -e "${YELLOW}  ⚠ R2 bucket already exists${NC}"
else
    echo "  Creating sandlot-sluggers-assets..."
    wrangler r2 bucket create sandlot-sluggers-assets
    echo -e "${GREEN}  ✓ Created${NC}"
fi
echo ""

# 7. Create R2 Bucket (Development)
echo -e "${BLUE}7/7${NC} Creating R2 Bucket (Development)..."
if wrangler r2 bucket list | grep -q "sandlot-sluggers-assets-dev"; then
    echo -e "${YELLOW}  ⚠ R2 bucket already exists${NC}"
else
    echo "  Creating sandlot-sluggers-assets-dev..."
    wrangler r2 bucket create sandlot-sluggers-assets-dev
    echo -e "${GREEN}  ✓ Created${NC}"
fi
echo ""

echo "================================"
echo "Updating wrangler.toml"
echo "================================"
echo ""

# Update wrangler.toml with IDs
if [ -f "wrangler.toml" ]; then
    # Backup original
    cp wrangler.toml wrangler.toml.backup

    # Update production database ID
    sed -i.tmp "s/database_id = \"TBD\" # Run: wrangler d1 create sandlot-sluggers-db/database_id = \"$D1_PROD_ID\"/" wrangler.toml

    # Update development database ID (if found)
    sed -i.tmp "s/database_name = \"sandlot-sluggers-db-dev\"$/database_name = \"sandlot-sluggers-db-dev\"\ndatabase_id = \"$D1_DEV_ID\"/" wrangler.toml

    # Update KV namespace IDs
    sed -i.tmp "s/id = \"TBD\" # Run: wrangler kv:namespace create \"SLUGGERS_KV\"/id = \"$KV_PROD_ID\"/" wrangler.toml

    # Clean up temp files
    rm -f wrangler.toml.tmp

    echo -e "${GREEN}✓ wrangler.toml updated${NC}"
    echo "  Backup saved: wrangler.toml.backup"
else
    echo -e "${RED}❌ wrangler.toml not found${NC}"
fi

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Resources created:"
echo -e "  ${GREEN}✓${NC} D1 Database (prod): $D1_PROD_ID"
echo -e "  ${GREEN}✓${NC} D1 Database (dev): $D1_DEV_ID"
echo -e "  ${GREEN}✓${NC} KV Namespace (prod): $KV_PROD_ID"
echo -e "  ${GREEN}✓${NC} KV Namespace (dev): $KV_DEV_ID"
echo -e "  ${GREEN}✓${NC} R2 Bucket: sandlot-sluggers-assets"
echo -e "  ${GREEN}✓${NC} R2 Bucket: sandlot-sluggers-assets-dev"
echo ""
echo "Next steps:"
echo "  1. Review updated wrangler.toml"
echo "  2. Upload assets to R2: ./scripts/upload-assets.sh"
echo "  3. Deploy game: npm run deploy"
echo ""
echo "⚾ Ready to deploy!"
