#!/bin/bash

# OUR-Bikes Store - Production Deployment Script
# Phase 21: Deployment & Production Readiness

echo "🚀 Starting Production Deployment..."

# Build Configuration
echo "📦 Building for Production..."
ng build --configuration production

if [ $? -eq 0 ]; then
    echo "✅ Build Successful!"
    
    # Create deployment package
    echo "📋 Creating Deployment Package..."
    tar -czf our-bikes-store-$(date +%Y%m%d-%H%M%S).tar.gz dist/
    
    echo "📊 Deployment Statistics:"
    echo "   - Bundle Size: $(du -sh dist/ | cut -f1)"
    echo "   - Files Created: $(find dist/ -type f | wc -l)"
    echo "   - Build Time: Completed successfully"
    
    echo "🎉 Production Build Ready!"
    echo "📁 Location: ./dist/"
    echo "🌐 Ready for deployment to any web server"
    
else
    echo "❌ Build Failed!"
    exit 1
fi
