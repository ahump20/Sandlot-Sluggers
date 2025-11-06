#!/bin/bash

# Sandlot Sluggers - Complete Deployment Script
# Builds and deploys both game and landing page

set -e

echo "⚾ Sandlot Sluggers - Deployment"
echo "==============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Parse arguments
DEPLOY_GAME=false
DEPLOY_LANDING=false
DEPLOY_ALL=false
ENVIRONMENT="production"

while [[ $# -gt 0 ]]; do
    case $1 in
        --game)
            DEPLOY_GAME=true
            shift
            ;;
        --landing)
            DEPLOY_LANDING=true
            shift
            ;;
        --all)
            DEPLOY_ALL=true
            shift
            ;;
        --dev)
            ENVIRONMENT="development"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./deploy.sh [--game] [--landing] [--all] [--dev]"
            exit 1
            ;;
    esac
done

# Default to all if nothing specified
if [ "$DEPLOY_GAME" = false ] && [ "$DEPLOY_LANDING" = false ]; then
    DEPLOY_ALL=true
fi

if [ "$DEPLOY_ALL" = true ]; then
    DEPLOY_GAME=true
    DEPLOY_LANDING=true
fi

echo -e "${BLUE}Deployment Mode: $ENVIRONMENT${NC}"
echo ""

# Deploy Game (Cloudflare Pages)
if [ "$DEPLOY_GAME" = true ]; then
    echo "================================"
    echo "1/2 Deploying Game (Cloudflare)"
    echo "================================"
    echo ""

    # Check dependencies
    echo "Checking dependencies..."
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi

    # Build game
    echo ""
    echo "Building game..."
    npm run build

    if [ ! -d "dist" ]; then
        echo -e "${RED}❌ Build failed - dist directory not found${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Build successful${NC}"
    echo ""

    # Deploy to Cloudflare Pages
    echo "Deploying to Cloudflare Pages..."
    if [ "$ENVIRONMENT" = "development" ]; then
        wrangler pages deploy dist --branch=development
    else
        wrangler pages deploy dist --branch=main
    fi

    echo -e "${GREEN}✓ Game deployed successfully${NC}"
    echo ""
fi

# Deploy Landing Page (Vercel)
if [ "$DEPLOY_LANDING" = true ]; then
    echo "================================"
    echo "2/2 Deploying Landing Page (Vercel)"
    echo "================================"
    echo ""

    cd landing-page

    # Check if vercel is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}Installing Vercel CLI...${NC}"
        npm install -g vercel
    fi

    # Check dependencies
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi

    # Build landing page
    echo ""
    echo "Building landing page..."
    npm run build

    if [ ! -d ".next" ]; then
        echo -e "${RED}❌ Build failed - .next directory not found${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Build successful${NC}"
    echo ""

    # Deploy to Vercel
    echo "Deploying to Vercel..."
    if [ "$ENVIRONMENT" = "development" ]; then
        vercel
    else
        vercel --prod
    fi

    echo -e "${GREEN}✓ Landing page deployed successfully${NC}"
    echo ""

    cd ..
fi

echo "================================"
echo "Deployment Complete!"
echo "================================"
echo ""

if [ "$DEPLOY_GAME" = true ]; then
    echo -e "${GREEN}✓${NC} Game deployed to Cloudflare Pages"
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "  URL: https://sandlot-sluggers.pages.dev"
    else
        echo "  URL: https://sandlot-sluggers-dev.pages.dev"
    fi
fi

if [ "$DEPLOY_LANDING" = true ]; then
    echo -e "${GREEN}✓${NC} Landing page deployed to Vercel"
    echo "  Check Vercel dashboard for URL"
fi

echo ""
echo "⚾ Ready to play ball!"
