#!/bin/bash

# =============================================================================
# LEVERAGE AI CMS - Quick Deployment Script
# Automates the entire deployment process to Cloudflare
# =============================================================================

set -e  # Exit on any error

echo "🚀 LEVERAGE AI CMS - Quick Deployment Script"
echo "=============================================="
echo ""

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    # Check Node version
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ required. Current version: $(node --version)"
        exit 1
    fi
    
    # Check Wrangler CLI
    if ! command -v wrangler &> /dev/null; then
        print_warning "Wrangler CLI not found. Installing..."
        npm install -g wrangler
    fi
    
    print_success "Prerequisites check complete!"
}

# Setup backend
setup_backend() {
    print_status "Setting up backend..."
    
    cd backend
    
    # Install dependencies
    print_status "Installing backend dependencies..."
    npm install
    
    # Login to Cloudflare (if not already logged in)
    print_status "Checking Cloudflare authentication..."
    if ! wrangler whoami &> /dev/null; then
        print_warning "Not logged in to Cloudflare. Opening login..."
        wrangler auth login
    fi
    
    # Create Cloudflare resources
    print_status "Creating Cloudflare resources..."
    
    print_status "Creating KV namespaces..."
    wrangler kv:namespace create "CONTENT" || true
    wrangler kv:namespace create "CONTENT" --preview || true
    wrangler kv:namespace create "USERS" || true
    wrangler kv:namespace create "USERS" --preview || true
    wrangler kv:namespace create "CACHE" || true
    wrangler kv:namespace create "CACHE" --preview || true
    
    print_status "Creating Vectorize index..."
    wrangler vectorize create cms-search --dimensions=768 --metric=cosine || true
    
    print_status "Creating D1 database..."
    wrangler d1 create cms-production || true
    
    print_warning "IMPORTANT: Update backend/wrangler.toml with the actual resource IDs shown above!"
    
    cd ..
    print_success "Backend setup complete!"
}

# Deploy backend
deploy_backend() {
    print_status "Deploying backend to Cloudflare Workers..."
    
    cd backend
    
    # Test locally first
    print_status "Testing backend locally..."
    timeout 10s wrangler dev --local &
    DEV_PID=$!
    sleep 5
    
    if curl -f http://localhost:8787/api/health &> /dev/null; then
        print_success "Local backend test passed!"
    else
        print_warning "Local backend test failed, but continuing..."
    fi
    
    kill $DEV_PID 2>/dev/null || true
    
    # Deploy to production
    print_status "Deploying to production..."
    wrangler deploy --env production
    
    cd ..
    print_success "Backend deployed successfully!"
}

# Setup frontend
setup_frontend() {
    print_status "Setting up frontend..."
    
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Build frontend
    print_status "Building frontend..."
    npm run build
    
    cd ..
    print_success "Frontend setup complete!"
}

# Deploy frontend to Cloudflare Pages
deploy_frontend() {
    print_status "Frontend deployment instructions..."
    
    echo ""
    print_warning "Frontend deployment requires manual setup in Cloudflare Dashboard:"
    echo ""
    echo "1. Go to https://dash.cloudflare.com"
    echo "2. Navigate to Workers & Pages"
    echo "3. Click 'Create application' → Pages tab"
    echo "4. Click 'Connect to Git'"
    echo "5. Select this repository: full-featured-cms-cloudflare"
    echo "6. Configure build settings:"
    echo "   - Build command: cd frontend && npm install && npm run build"
    echo "   - Build output directory: frontend/dist"
    echo "   - Root directory: /"
    echo "7. Add environment variables:"
    echo "   - NODE_VERSION = 18"
    echo "   - VITE_API_URL = https://leverage-ai-cms-prod.[your-subdomain].workers.dev"
    echo "8. Click 'Save and Deploy'"
    echo ""
    print_success "Frontend ready for deployment!"
}

# Test deployment
test_deployment() {
    print_status "Testing deployment..."
    
    # Test backend health endpoint
    BACKEND_URL="https://leverage-ai-cms-prod.$(wrangler whoami | grep "Account" | awk '{print $3}').workers.dev"
    
    print_status "Testing backend health endpoint..."
    if curl -f "$BACKEND_URL/api/health" &> /dev/null; then
        print_success "Backend health check passed!"
        curl -s "$BACKEND_URL/api/health" | head -3
    else
        print_warning "Backend health check failed. Check deployment."
    fi
}

# Main deployment flow
main() {
    echo "Starting LEVERAGE AI CMS deployment..."
    echo ""
    
    # Prompt user for confirmation
    read -p "This will deploy your CMS to Cloudflare. Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled."
        exit 0
    fi
    
    check_prerequisites
    setup_backend
    deploy_backend
    setup_frontend
    deploy_frontend
    test_deployment
    
    echo ""
    print_success "🎉 LEVERAGE AI CMS deployment complete!"
    echo ""
    echo "Next steps:"
    echo "1. Update backend/wrangler.toml with actual resource IDs"
    echo "2. Set up frontend deployment in Cloudflare Pages dashboard"
    echo "3. Test your CMS at the deployed URLs"
    echo ""
    echo "Documentation: https://github.com/mikeschlottig/full-featured-cms-cloudflare/blob/main/docs/deployment-guide.md"
}

# Handle script arguments
case "${1:-}" in
    "backend")
        check_prerequisites
        setup_backend
        deploy_backend
        ;;
    "frontend")
        setup_frontend
        deploy_frontend
        ;;
    "test")
        test_deployment
        ;;
    *)
        main
        ;;
esac