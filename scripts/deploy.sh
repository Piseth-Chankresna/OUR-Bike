#!/bin/bash

# Deployment script for OUR-Bikes Store
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOYMENT_ENV=${1:-production}
REMOTE_HOST=${2:-"your-server.com"}
REMOTE_USER=${3:-"deploy"}
REMOTE_PATH=${4:-"/var/www/ourbikes-store"}

echo -e "${BLUE}🚀 Deploying OUR-Bikes Store to $DEPLOYMENT_ENV...${NC}"

# Function to deploy locally
deploy_local() {
    echo -e "${YELLOW}📦 Local deployment...${NC}"
    
    # Build the application
    ./scripts/build.sh
    
    # Copy to local web server directory
    if [ -d "/var/www/html" ]; then
        echo -e "${YELLOW}📋 Copying files to /var/www/html...${NC}"
        sudo rm -rf /var/www/html/*
        sudo cp -r dist/our-bikes-store/* /var/www/html/
        sudo chown -R www-data:www-data /var/www/html/
        echo -e "${GREEN}✅ Local deployment completed${NC}"
    else
        echo -e "${RED}❌ Web server directory not found${NC}"
        echo "Please install Apache or Nginx first"
    fi
}

# Function to deploy via Docker
deploy_docker() {
    echo -e "${YELLOW}🐳 Docker deployment...${NC}"
    
    # Build Docker image
    echo -e "${YELLOW}🏗️  Building Docker image...${NC}"
    docker build -t ourbikes-store:latest .
    
    # Stop existing container
    echo -e "${YELLOW}🛑 Stopping existing container...${NC}"
    docker stop ourbikes-store 2>/dev/null || true
    docker rm ourbikes-store 2>/dev/null || true
    
    # Run new container
    echo -e "${YELLOW}🚀 Starting new container...${NC}"
    docker run -d \
        --name ourbikes-store \
        -p 80:80 \
        --restart unless-stopped \
        ourbikes-store:latest
    
    echo -e "${GREEN}✅ Docker deployment completed${NC}"
    echo -e "${BLUE}🌐 Application is available at: http://localhost${NC}"
}

# Function to deploy to remote server
deploy_remote() {
    echo -e "${YELLOW}🌐 Remote deployment to $REMOTE_HOST...${NC}"
    
    # Build the application
    ./scripts/build.sh
    
    # Create deployment package
    TIMESTAMP=$(date +%Y%m%d_%H%M%S)
    PACKAGE_NAME="ourbikes-store-${TIMESTAMP}.tar.gz"
    tar -czf "$PACKAGE_NAME" dist/
    
    # Copy to remote server
    echo -e "${YELLOW}📋 Copying files to remote server...${NC}"
    scp "$PACKAGE_NAME" "$REMOTE_USER@$REMOTE_HOST:/tmp/"
    
    # Extract and deploy on remote server
    echo -e "${YELLOW}📦 Extracting and deploying on remote server...${NC}"
    ssh "$REMOTE_USER@$REMOTE_HOST" "
        cd $REMOTE_PATH
        tar -xzf /tmp/$PACKAGE_NAME
        rm -rf backup-$(date +%Y%m%d)
        mv current backup-$(date +%Y%m%d) 2>/dev/null || true
        mv dist current
        chown -R www-data:www-data current
        rm /tmp/$PACKAGE_NAME
        systemctl reload nginx
    "
    
    # Clean up local package
    rm "$PACKAGE_NAME"
    
    echo -e "${GREEN}✅ Remote deployment completed${NC}"
    echo -e "${BLUE}🌐 Application is available at: https://$REMOTE_HOST${NC}"
}

# Function to deploy to Vercel
deploy_vercel() {
    echo -e "${YELLOW}⚡ Vercel deployment...${NC}"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${YELLOW}📥 Installing Vercel CLI...${NC}"
        npm install -g vercel
    fi
    
    # Build and deploy
    echo -e "${YELLOW}🏗️  Building and deploying to Vercel...${NC}"
    vercel --prod
    
    echo -e "${GREEN}✅ Vercel deployment completed${NC}"
}

# Function to deploy to Netlify
deploy_netlify() {
    echo -e "${YELLOW}🌐 Netlify deployment...${NC}"
    
    # Check if Netlify CLI is installed
    if ! command -v netlify &> /dev/null; then
        echo -e "${YELLOW}📥 Installing Netlify CLI...${NC}"
        npm install -g netlify-cli
    fi
    
    # Build and deploy
    echo -e "${YELLOW}🏗️  Building and deploying to Netlify...${NC}"
    npm run build
    netlify deploy --prod --dir=dist/our-bikes-store
    
    echo -e "${GREEN}✅ Netlify deployment completed${NC}"
}

# Main deployment logic
case $DEPLOYMENT_ENV in
    "local")
        deploy_local
        ;;
    "docker")
        deploy_docker
        ;;
    "remote")
        deploy_remote
        ;;
    "vercel")
        deploy_vercel
        ;;
    "netlify")
        deploy_netlify
        ;;
    *)
        echo -e "${RED}❌ Unknown deployment environment: $DEPLOYMENT_ENV${NC}"
        echo -e "${YELLOW}Available options:${NC}"
        echo "  local  - Deploy to local web server"
        echo "  docker - Deploy using Docker containers"
        echo "  remote - Deploy to remote server (requires host, user, path)"
        echo "  vercel - Deploy to Vercel"
        echo "  netlify - Deploy to Netlify"
        echo ""
        echo -e "${YELLOW}Usage:${NC}"
        echo "  $0 [environment] [host] [user] [path]"
        echo "  $0 remote your-server.com deploy /var/www/ourbikes-store"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"

# Health check
echo -e "${YELLOW}🔍 Running health check...${NC}"
sleep 5

if [ "$DEPLOYMENT_ENV" = "docker" ]; then
    if curl -f http://localhost > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Health check passed${NC}"
    else
        echo -e "${RED}❌ Health check failed${NC}"
    fi
fi

echo -e "${BLUE}📋 Post-deployment checklist:${NC}"
echo "1. Verify the application is accessible"
echo "2. Test all major functionality"
echo "3. Check SEO meta tags"
echo "4. Verify PWA functionality"
echo "5. Test responsive design"
echo "6. Check performance metrics"
