#!/bin/bash

# Production build script for OUR-Bikes Store
set -e

echo "🚀 Starting production build for OUR-Bikes Store..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v)
echo -e "${YELLOW}📦 Using Node.js version: $NODE_VERSION${NC}"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing dependencies...${NC}"
    npm ci
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# Clean previous build
echo -e "${YELLOW}🧹 Cleaning previous build...${NC}"
rm -rf dist/

# Run tests (if available)
if [ -d "src" ] && grep -q "test" package.json; then
    echo -e "${YELLOW}🧪 Running tests...${NC}"
    npm test -- --watch=false --browsers=ChromeHeadless --code-coverage
fi

# Build for production
echo -e "${YELLOW}🏗️  Building for production...${NC}"
npm run build --configuration=production

# Check if build was successful
if [ -d "dist/our-bikes-store" ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
    
    # Show build statistics
    echo -e "${YELLOW}📊 Build statistics:${NC}"
    du -sh dist/our-bikes-store
    find dist/our-bikes-store -name "*.js" | wc -l | xargs echo "JavaScript files:"
    find dist/our-bikes-store -name "*.css" | wc -l | xargs echo "CSS files:"
    
    # Check bundle size
    BUNDLE_SIZE=$(du -k dist/our-bikes-store | cut -f1)
    if [ "$BUNDLE_SIZE" -lt 1000 ]; then
        echo -e "${GREEN}✅ Bundle size is optimal: ${BUNDLE_SIZE}KB${NC}"
    elif [ "$BUNDLE_SIZE" -lt 2000 ]; then
        echo -e "${YELLOW}⚠️  Bundle size is acceptable: ${BUNDLE_SIZE}KB${NC}"
    else
        echo -e "${RED}❌ Bundle size is large: ${BUNDLE_SIZE}KB. Consider optimization.${NC}"
    fi
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Generate sitemap
echo -e "${YELLOW}🗺️  Generating sitemap...${NC}"
if [ -f "dist/our-bikes-store/index.html" ]; then
    echo "Sitemap would be generated here in a real deployment"
fi

# Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE_NAME="ourbikes-store-build-${TIMESTAMP}.tar.gz"

tar -czf "$PACKAGE_NAME" dist/ docker-compose.yml Dockerfile nginx.conf

echo -e "${GREEN}✅ Deployment package created: $PACKAGE_NAME${NC}"

echo -e "${GREEN}🎉 Build process completed successfully!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo "1. Test the application locally: npm run serve:ssr"
echo "2. Deploy using Docker: docker-compose up -d"
echo "3. Or deploy the dist/ folder to your web server"
