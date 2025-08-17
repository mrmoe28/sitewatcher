#!/bin/bash

echo "🚀 Manual Vercel Deployment Debug Script"
echo "========================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "📋 Current directory contents:"
ls -la

echo ""
echo "📦 Running build locally first..."
npm run build:vercel

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
    
    echo ""
    echo "📁 Build output contents:"
    ls -la dist/public/
    
    echo ""
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
    else
        echo "❌ Deployment failed!"
        echo "📋 Checking Vercel logs..."
        vercel logs
    fi
else
    echo "❌ Local build failed! Fix the build issues first."
    exit 1
fi
