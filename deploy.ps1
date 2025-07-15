# =============================================================================
# LEVERAGE AI CMS - Windows Deployment Script (PowerShell)
# Automates the entire deployment process to Cloudflare on Windows
# =============================================================================

param(
    [string]$Action = "full"
)

# Colors for PowerShell output
function Write-Success { 
    param([string]$Message)
    Write-Host "✅ [SUCCESS] $Message" -ForegroundColor Green 
}

function Write-Info { 
    param([string]$Message)
    Write-Host "ℹ️  [INFO] $Message" -ForegroundColor Cyan 
}

function Write-Warning { 
    param([string]$Message)
    Write-Host "⚠️  [WARNING] $Message" -ForegroundColor Yellow 
}

function Write-Error { 
    param([string]$Message)
    Write-Host "❌ [ERROR] $Message" -ForegroundColor Red 
}

Write-Host "🚀 LEVERAGE AI CMS - Windows Deployment Script" -ForegroundColor Magenta
Write-Host "=================================================" -ForegroundColor Magenta
Write-Host ""

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        if ($nodeVersion) {
            $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
            if ($versionNumber -lt 18) {
                Write-Error "Node.js version 18+ required. Current: $nodeVersion"
                Write-Error "Download from: https://nodejs.org/"
                exit 1
            }
            Write-Success "Node.js version: $nodeVersion ✓"
        }
    }
    catch {
        Write-Error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    }
    
    # Check NPM
    try {
        $npmVersion = npm --version
        Write-Success "NPM version: $npmVersion ✓"
    }
    catch {
        Write-Error "NPM not found. Please reinstall Node.js."
        exit 1
    }
    
    # Check/Install Wrangler CLI
    try {
        $wranglerVersion = wrangler --version 2>$null
        if ($wranglerVersion) {
            Write-Success "Wrangler CLI: $wranglerVersion ✓"
        }
    }
    catch {
        Write-Warning "Wrangler CLI not found. Installing..."
        npm install -g wrangler
        Write-Success "Wrangler CLI installed!"
    }
    
    Write-Success "Prerequisites check complete!"
}

# Setup backend
function Setup-Backend {
    Write-Info "Setting up backend..."
    
    if (-not (Test-Path "backend")) {
        Write-Error "Backend directory not found. Make sure you're in the project root."
        exit 1
    }
    
    Set-Location backend
    
    # Install dependencies
    Write-Info "Installing backend dependencies..."
    npm install
    
    # Check Cloudflare authentication
    Write-Info "Checking Cloudflare authentication..."
    try {
        $whoami = wrangler whoami 2>$null
        if ($whoami) {
            Write-Success "Logged in to Cloudflare!"
        }
    }
    catch {
        Write-Warning "Not logged in to Cloudflare. Opening login..."
        wrangler auth login
    }
    
    # Create Cloudflare resources
    Write-Info "Creating Cloudflare resources..."
    Write-Info "This will create KV namespaces, Vectorize index, and D1 database..."
    
    Write-Info "Creating KV namespaces..."
    Write-Host "Running: wrangler kv:namespace create CONTENT"
    wrangler kv:namespace create "CONTENT"
    Write-Host "Running: wrangler kv:namespace create CONTENT --preview"
    wrangler kv:namespace create "CONTENT" --preview
    Write-Host "Running: wrangler kv:namespace create USERS"
    wrangler kv:namespace create "USERS"
    Write-Host "Running: wrangler kv:namespace create USERS --preview"
    wrangler kv:namespace create "USERS" --preview
    Write-Host "Running: wrangler kv:namespace create CACHE"
    wrangler kv:namespace create "CACHE"
    Write-Host "Running: wrangler kv:namespace create CACHE --preview"
    wrangler kv:namespace create "CACHE" --preview
    
    Write-Info "Creating Vectorize index..."
    Write-Host "Running: wrangler vectorize create cms-search --dimensions=768 --metric=cosine"
    wrangler vectorize create cms-search --dimensions=768 --metric=cosine
    
    Write-Info "Creating D1 database..."
    Write-Host "Running: wrangler d1 create cms-production"
    wrangler d1 create cms-production
    
    Write-Warning "IMPORTANT: Copy the resource IDs shown above and update backend/wrangler.toml!"
    Write-Host "Press any key to continue after updating wrangler.toml..." -ForegroundColor Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    Set-Location ..
    Write-Success "Backend setup complete!"
}

# Deploy backend
function Deploy-Backend {
    Write-Info "Deploying backend to Cloudflare Workers..."
    
    Set-Location backend
    
    # Test configuration
    Write-Info "Testing Wrangler configuration..."
    try {
        wrangler deploy --dry-run --env production
        Write-Success "Configuration valid!"
    }
    catch {
        Write-Error "Configuration error. Please check backend/wrangler.toml"
        Set-Location ..
        exit 1
    }
    
    # Deploy to production
    Write-Info "Deploying to production..."
    try {
        wrangler deploy --env production
        Write-Success "Backend deployed successfully!"
    }
    catch {
        Write-Error "Deployment failed. Check the error above."
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
}

# Setup frontend
function Setup-Frontend {
    Write-Info "Setting up frontend..."
    
    if (-not (Test-Path "frontend")) {
        Write-Error "Frontend directory not found."
        exit 1
    }
    
    Set-Location frontend
    
    # Install dependencies
    Write-Info "Installing frontend dependencies..."
    npm install
    
    # Test build
    Write-Info "Testing frontend build..."
    try {
        npm run build
        Write-Success "Frontend build successful!"
    }
    catch {
        Write-Error "Frontend build failed."
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
    Write-Success "Frontend setup complete!"
}

# Frontend deployment instructions
function Show-FrontendDeployment {
    Write-Info "Frontend deployment instructions..."
    Write-Host ""
    Write-Host "🌐 CLOUDFLARE PAGES SETUP:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to: https://dash.cloudflare.com"
    Write-Host "2. Navigate to: Workers & Pages"
    Write-Host "3. Click: 'Create application' → 'Pages' tab"
    Write-Host "4. Click: 'Connect to Git'"
    Write-Host "5. Select repository: full-featured-cms-cloudflare"
    Write-Host ""
    Write-Host "⚙️  BUILD SETTINGS:" -ForegroundColor Yellow
    Write-Host "   Build command: cd frontend && npm install && npm run build"
    Write-Host "   Build output directory: frontend/dist"
    Write-Host "   Root directory: /"
    Write-Host ""
    Write-Host "🔧 ENVIRONMENT VARIABLES:" -ForegroundColor Yellow
    Write-Host "   NODE_VERSION = 18"
    Write-Host "   VITE_API_URL = https://leverage-ai-cms-prod.[your-subdomain].workers.dev"
    Write-Host ""
    Write-Host "7. Click: 'Save and Deploy'"
    Write-Host ""
    Write-Success "Frontend ready for Cloudflare Pages deployment!"
}

# Test deployment
function Test-Deployment {
    Write-Info "Testing deployment..."
    
    # Test health endpoint if we can determine the URL
    try {
        Write-Info "Testing backend health endpoint..."
        # Try to get the worker URL from the deployment
        # This is a simplified test - actual URL would be from deployment output
        Write-Warning "Manual test: Visit your worker URL + /api/health to verify deployment"
    }
    catch {
        Write-Warning "Could not automatically test deployment. Please test manually."
    }
}

# Main deployment function
function Start-Deployment {
    Write-Host ""
    $continue = Read-Host "This will deploy your CMS to Cloudflare. Continue? (y/N)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "Deployment cancelled."
        exit 0
    }
    
    Test-Prerequisites
    Setup-Backend
    Deploy-Backend
    Setup-Frontend
    Show-FrontendDeployment
    Test-Deployment
    
    Write-Host ""
    Write-Success "🎉 LEVERAGE AI CMS deployment complete!"
    Write-Host ""
    Write-Host "📋 NEXT STEPS:" -ForegroundColor Green
    Write-Host "1. Complete frontend deployment in Cloudflare Pages dashboard"
    Write-Host "2. Test your CMS at the deployed URLs"
    Write-Host "3. Review documentation: docs/deployment-guide.md"
    Write-Host ""
    Write-Info "Happy content creating! 🚀"
}

# Handle script parameters
switch ($Action.ToLower()) {
    "backend" {
        Test-Prerequisites
        Setup-Backend
        Deploy-Backend
    }
    "frontend" {
        Setup-Frontend
        Show-FrontendDeployment
    }
    "test" {
        Test-Deployment
    }
    default {
        Start-Deployment
    }
}