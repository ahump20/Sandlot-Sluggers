#!/bin/bash

# MMI Deployment Script for blazesportsintel.com
# Creates all Cloudflare resources and deploys the Worker

set -e  # Exit on error

ENV=${1:-dev}
echo "🚀 Deploying MMI system to $ENV environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}⚠️  Wrangler CLI not found. Installing...${NC}"
    npm install -g wrangler
fi

# Check if logged in to Cloudflare
echo -e "${BLUE}🔐 Checking Cloudflare authentication...${NC}"
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare. Running login...${NC}"
    wrangler login
fi

# Step 1: Create D1 Database (if not exists)
echo -e "${BLUE}📊 Setting up D1 database...${NC}"
DB_NAME="mmi-database-${ENV}"

# Check if database exists
if wrangler d1 list | grep -q "$DB_NAME"; then
    echo -e "${GREEN}✓ Database $DB_NAME already exists${NC}"
else
    echo -e "${BLUE}Creating database $DB_NAME...${NC}"
    wrangler d1 create "$DB_NAME"
fi

# Get database ID
DB_ID=$(wrangler d1 list | grep "$DB_NAME" | awk '{print $2}')
echo -e "${GREEN}✓ Database ID: $DB_ID${NC}"

# Apply schema
echo -e "${BLUE}📝 Applying database schema...${NC}"
wrangler d1 execute "$DB_NAME" --file=./schema.sql

# Verify tables created
echo -e "${BLUE}🔍 Verifying database tables...${NC}"
wrangler d1 execute "$DB_NAME" --command="SELECT name FROM sqlite_master WHERE type='table';"

# Step 2: Create KV Namespace (if not exists)
echo -e "${BLUE}🗄️  Setting up KV namespace...${NC}"
KV_NAME="mmi-cache-${ENV}"

# Check if KV exists
if wrangler kv:namespace list | grep -q "$KV_NAME"; then
    echo -e "${GREEN}✓ KV namespace $KV_NAME already exists${NC}"
else
    echo -e "${BLUE}Creating KV namespace $KV_NAME...${NC}"
    wrangler kv:namespace create "$KV_NAME"
fi

# Get KV ID
KV_ID=$(wrangler kv:namespace list | grep "$KV_NAME" | awk '{print $2}' | tr -d '"')
echo -e "${GREEN}✓ KV namespace ID: $KV_ID${NC}"

# Step 3: Update wrangler.toml with IDs
echo -e "${BLUE}📄 Updating wrangler.toml...${NC}"

cat > wrangler.toml << EOF
name = "mmi-engine"
main = "worker-mmi-engine.js"
compatibility_date = "2024-11-21"

# D1 Database binding
[[d1_databases]]
binding = "MMI_DB"
database_name = "$DB_NAME"
database_id = "$DB_ID"

# KV namespace binding
[[kv_namespaces]]
binding = "MMI_KV"
id = "$KV_ID"

# Routes (update domain after custom domain setup)
[[routes]]
pattern = "blazesportsintel.com/mmi/*"
zone_name = "blazesportsintel.com"

[[routes]]
pattern = "www.blazesportsintel.com/mmi/*"
zone_name = "blazesportsintel.com"

[env.dev]
name = "mmi-engine-dev"

[env.prod]
name = "mmi-engine-prod"
EOF

echo -e "${GREEN}✓ wrangler.toml updated${NC}"

# Step 4: Deploy Worker
echo -e "${BLUE}🚀 Deploying Worker to Cloudflare...${NC}"

if [ "$ENV" == "prod" ]; then
    wrangler deploy --env prod
else
    wrangler deploy --env dev
fi

echo -e "${GREEN}✓ Worker deployed successfully!${NC}"

# Step 5: Deploy Dashboard to Cloudflare Pages
echo -e "${BLUE}📱 Deploying dashboard to Cloudflare Pages...${NC}"

PAGES_PROJECT="mmi-dashboard-${ENV}"

# Check if Pages project exists
if wrangler pages project list | grep -q "$PAGES_PROJECT"; then
    echo -e "${GREEN}✓ Pages project $PAGES_PROJECT exists${NC}"
else
    echo -e "${BLUE}Creating Pages project $PAGES_PROJECT...${NC}"
    wrangler pages project create "$PAGES_PROJECT" --production-branch=main
fi

# Deploy dashboard
echo -e "${BLUE}Deploying dashboard HTML...${NC}"
wrangler pages deploy . --project-name="$PAGES_PROJECT" --branch=main

echo -e "${GREEN}✓ Dashboard deployed!${NC}"

# Step 6: Run initial tests
echo -e "${BLUE}🧪 Running validation tests...${NC}"

if [ -f "test-mmi.js" ]; then
    node test-mmi.js
else
    echo -e "${YELLOW}⚠️  test-mmi.js not found, skipping tests${NC}"
fi

# Step 7: Display deployment summary
echo -e "\n${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                ║${NC}"
echo -e "${GREEN}║     MMI Deployment Complete! 🎉                ║${NC}"
echo -e "${GREEN}║                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}📍 Endpoints:${NC}"
echo -e "  Worker: https://mmi-engine-${ENV}.<your-subdomain>.workers.dev"
echo -e "  Dashboard: https://$PAGES_PROJECT.pages.dev"
echo -e ""
echo -e "${BLUE}🔗 API Routes:${NC}"
echo -e "  GET /mmi/games/today              - Today's live games"
echo -e "  GET /mmi/:gameId                  - Calculate MMI for game"
echo -e "  GET /mmi/history/:playerId        - Player MMI history"
echo -e "  GET /mmi/top?limit=10&timeframe=7 - Top MMI moments"
echo -e ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo -e "  1. Update dashboard HTML with your Worker URL"
echo -e "     Edit mmi-dashboard.html, line 286: const API_BASE = '...'"
echo -e "  2. Test endpoints: curl https://your-worker.workers.dev/mmi/games/today"
echo -e "  3. Add custom domain in Cloudflare Dashboard > Workers & Pages"
echo -e "  4. Update routes in wrangler.toml for blazesportsintel.com"
echo -e "  5. Monitor logs: wrangler tail mmi-engine-${ENV}"
echo -e ""
echo -e "${BLUE}📊 Database Info:${NC}"
echo -e "  Name: $DB_NAME"
echo -e "  ID: $DB_ID"
echo -e "  Query: wrangler d1 execute $DB_NAME --command='SELECT * FROM mmi_moments LIMIT 5'"
echo -e ""
echo -e "${BLUE}🗄️  KV Info:${NC}"
echo -e "  Name: $KV_NAME"
echo -e "  ID: $KV_ID"
echo -e "  List keys: wrangler kv:key list --namespace-id=$KV_ID"
echo -e ""
echo -e "${GREEN}✅ Deployment successful!${NC}\n"

exit 0
