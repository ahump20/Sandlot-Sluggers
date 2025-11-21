#!/bin/bash

# MMI Deployment Script
# Deploys MMI system to Cloudflare (Worker + D1 + KV)

set -e

ENV=${1:-prod}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🚀 Deploying MMI system to $ENV environment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  echo "❌ Error: wrangler CLI not found. Install with: npm install -g wrangler"
  exit 1
fi

# Check if authenticated
if ! wrangler whoami &> /dev/null; then
  echo "❌ Error: Not authenticated. Run: wrangler login"
  exit 1
fi

echo ""
echo "📦 Step 1: Creating D1 database..."
DB_NAME="mmi-db"
if [ "$ENV" != "prod" ]; then
  DB_NAME="mmi-db-dev"
fi

# Check if database already exists
DB_EXISTS=$(wrangler d1 list | grep -c "$DB_NAME" || true)

if [ "$DB_EXISTS" -eq 0 ]; then
  echo "Creating new database: $DB_NAME"
  DB_OUTPUT=$(wrangler d1 create "$DB_NAME")
  DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+' || echo "")
  
  if [ -z "$DB_ID" ]; then
    echo "⚠️  Could not extract database ID. Please update wrangler.toml manually."
  else
    echo "✅ Database created with ID: $DB_ID"
    # Update wrangler.toml with database ID
    if [ "$ENV" == "prod" ]; then
      sed -i.bak "s/database_id = \"\"/database_id = \"$DB_ID\"/" wrangler.toml
    else
      sed -i.bak "s/database_id = \"\"/database_id = \"$DB_ID\"/" wrangler.toml
    fi
    rm -f wrangler.toml.bak
  fi
else
  echo "✅ Database $DB_NAME already exists"
  # Get existing database ID
  DB_ID=$(wrangler d1 list | grep "$DB_NAME" | awk '{print $2}' || echo "")
  if [ -n "$DB_ID" ]; then
    echo "Using existing database ID: $DB_ID"
    if [ "$ENV" == "prod" ]; then
      sed -i.bak "s/database_id = \"\"/database_id = \"$DB_ID\"/" wrangler.toml
    else
      sed -i.bak "s/database_id = \"\"/database_id = \"$DB_ID\"/" wrangler.toml
    fi
    rm -f wrangler.toml.bak
  fi
fi

echo ""
echo "📊 Step 2: Applying database schema..."
if [ -f "schema.sql" ]; then
  wrangler d1 execute "$DB_NAME" --file=./schema.sql
  echo "✅ Schema applied"
else
  echo "❌ Error: schema.sql not found"
  exit 1
fi

echo ""
echo "🗄️  Step 3: Creating KV namespace..."
KV_NAME="MMI_KV"
if [ "$ENV" != "prod" ]; then
  KV_NAME="MMI_KV_DEV"
fi

# Check if KV namespace already exists
KV_EXISTS=$(wrangler kv:namespace list | grep -c "$KV_NAME" || true)

if [ "$KV_EXISTS" -eq 0 ]; then
  echo "Creating KV namespace: $KV_NAME"
  KV_OUTPUT=$(wrangler kv:namespace create "$KV_NAME")
  KV_ID=$(echo "$KV_OUTPUT" | grep -oP 'id = "\K[^"]+' || echo "")
  
  if [ -z "$KV_ID" ]; then
    echo "⚠️  Could not extract KV ID. Please update wrangler.toml manually."
  else
    echo "✅ KV namespace created with ID: $KV_ID"
    # Update wrangler.toml with KV ID
    if [ "$ENV" == "prod" ]; then
      sed -i.bak "s/id = \"\"/id = \"$KV_ID\"/" wrangler.toml
    else
      sed -i.bak "s/id = \"\"/id = \"$KV_ID\"/" wrangler.toml
    fi
    rm -f wrangler.toml.bak
  fi
else
  echo "✅ KV namespace $KV_NAME already exists"
  # Get existing KV ID
  KV_ID=$(wrangler kv:namespace list | grep "$KV_NAME" | awk '{print $2}' || echo "")
  if [ -n "$KV_ID" ]; then
    echo "Using existing KV ID: $KV_ID"
    if [ "$ENV" == "prod" ]; then
      sed -i.bak "s/id = \"\"/id = \"$KV_ID\"/" wrangler.toml
    else
      sed -i.bak "s/id = \"\"/id = \"$KV_ID\"/" wrangler.toml
    fi
    rm -f wrangler.toml.bak
  fi
fi

echo ""
echo "🚀 Step 4: Deploying Worker..."
wrangler deploy --env "$ENV"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Verify Worker is live: curl https://blazesportsintel.com/mmi/games/today"
echo "2. Deploy dashboard: wrangler pages deploy mmi-dashboard.html --project-name=mmi-live"
echo "3. Test MMI calculation: curl https://blazesportsintel.com/mmi/717715"
echo ""
echo "🔗 Dashboard URL: https://mmi-live.pages.dev (after Pages deployment)"
echo "🔗 API Base: https://blazesportsintel.com/mmi"
