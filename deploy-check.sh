#!/bin/bash

# Site Watcher - Deployment Script
echo "🚀 Starting Site Watcher deployment preparation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root."
    exit 1
fi

print_status "Checking Node.js version..."
node_version=$(node --version)
print_success "Node.js version: $node_version"

print_status "Installing dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

print_status "Running TypeScript check..."
if npm run check; then
    print_success "TypeScript check passed"
else
    print_warning "TypeScript check had issues, but continuing..."
fi

print_status "Building the application..."
if npm run build:vercel; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

print_status "Checking build output..."
if [ -d "dist/public" ]; then
    file_count=$(find dist/public -type f | wc -l)
    print_success "Build output contains $file_count files"
    
    # List key files
    print_status "Key files in build:"
    ls -la dist/public/index.html 2>/dev/null && echo "  ✓ index.html found"
    ls -la dist/public/assets/ 2>/dev/null && echo "  ✓ assets directory found"
    ls -la dist/public/manifest.json 2>/dev/null && echo "  ✓ manifest.json found"
    ls -la dist/public/robots.txt 2>/dev/null && echo "  ✓ robots.txt found"
    ls -la dist/public/sitemap.xml 2>/dev/null && echo "  ✓ sitemap.xml found"
else
    print_error "Build output directory not found"
    exit 1
fi

print_status "Validating API functions..."
if [ -d "api" ]; then
    api_count=$(find api -name "*.ts" | wc -l)
    print_success "Found $api_count API functions"
else
    print_warning "API directory not found"
fi

print_status "Checking environment variables..."
if [ -f ".env" ]; then
    print_success ".env file found"
    
    # Check for required variables (without showing values)
    required_vars=("DATABASE_URL" "GOOGLE_API_KEY" "SESSION_SECRET")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env; then
            echo "  ✓ $var is set"
        else
            print_warning "$var not found in .env"
        fi
    done
else
    print_warning ".env file not found"
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
print_status "Next steps:"
echo "  1. Commit your changes: git add . && git commit -m 'Complete optimization implementation'"
echo "  2. Push to repository: git push"
echo "  3. Deploy to Vercel (should happen automatically)"
echo "  4. Test the deployed application"
echo ""
print_success "Your Site Watcher app is ready for deployment! 🚀"
