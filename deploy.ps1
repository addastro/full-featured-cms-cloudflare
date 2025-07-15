# =============================================================================
# LEVERAGE AI CMS - Windows Deployment Script (PowerShell)
# Automates the entire deployment process to Cloudflare on Windows
# =============================================================================

param(
    [string]$Action = "full"
)

# Colors for PowerShell output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$ForegroundColor = "White"
    )
    Write-Host $Message -ForegroundColor $ForegroundColor
}

function Write-Success { Write-ColorOutput "✅ [SUCCESS] $args" -ForegroundColor Green }
function Write-Info { Write-ColorOutput "ℹ️  [INFO] $args" -ForegroundColor Cyan }
function Write-Warning { Write-ColorOutput "⚠️  [WARNING] $args" -ForegroundColor Yellow }
function Write-Error { Write-ColorOutput "❌ [ERROR] $args" -ForegroundColor Red }

Write-ColorOutput "🚀 LEVERAGE AI CMS - Windows Deployment Script" -ForegroundColor Magenta
Write-ColorOutput "=================================================" -ForegroundColor Magenta
Write-Host ""

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking prerequisites..."
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        $versionNumber = [int]($nodeVersion -replace 'v|\..*', '')
        if ($versionNumber -lt 18) {
            Write-Error "Node.js version 18+ required. Current: $nodeVersion"
            Write-Error "Download from: https://nodejs.org/"
            exit 1
        }
        Write-Success "Node.js version: $nodeVersion ✓"
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
        $wranglerVersion = wrangler --version
        Write-Success "Wrangler CLI: $wranglerVersion ✓"
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
        Write-Success "Logged in to Cloudflare: $whoami"
    }
    catch {
        Write-Warning "Not logged in to Cloudflare. Opening login..."
        wrangler auth login
    }
    
    # Create Cloudflare resources
    Write-Info "Creating Cloudflare resources..."
    Write-Info "This will create KV namespaces, Vectorize index, and D1 database..."
    
    Write-Info "Creating KV namespaces..."
    try { wrangler kv:namespace create "CONTENT" } catch { Write-Warning "CONTENT KV may already exist" }
    try { wrangler kv:namespace create "CONTENT" --preview } catch { Write-Warning "CONTENT preview KV may already exist" }
    try { wrangler kv:namespace create "USERS" } catch { Write-Warning "USERS KV may already exist" }
    try { wrangler kv:namespace create "USERS" --preview } catch { Write-Warning "USERS preview KV may already exist" }
    try { wrangler kv:namespace create "CACHE" } catch { Write-Warning "CACHE KV may already exist" }
    try { wrangler kv:namespace create "CACHE" --preview } catch { Write-Warning "CACHE preview KV may already exist" }
    
    Write-Info "Creating Vectorize index..."
    try { wrangler vectorize create cms-search --dimensions=768 --metric=cosine } catch { Write-Warning "Vectorize index may already exist" }
    
    Write-Info "Creating D1 database..."
    try { wrangler d1 create cms-production } catch { Write-Warning "D1 database may already exist" }
    
    Write-Warning "IMPORTANT: Copy the resource IDs shown above and update backend/wrangler.toml!"
    Write-Info "Press any key to continue after updating wrangler.toml..."
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
    Write-ColorOutput "🌐 CLOUDFLARE PAGES SETUP:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Go to: https://dash.cloudflare.com"
    Write-Host "2. Navigate to: Workers & Pages"
    Write-Host "3. Click: 'Create application' → 'Pages' tab"
    Write-Host "4. Click: 'Connect to Git'"
    Write-Host "5. Select repository: full-featured-cms-cloudflare"
    Write-Host ""
    Write-ColorOutput "⚙️  BUILD SETTINGS:" -ForegroundColor Yellow
    Write-Host "   Build command: cd frontend && npm install && npm run build"
    Write-Host "   Build output directory: frontend/dist"
    Write-Host "   Root directory: /"
    Write-Host ""
    Write-ColorOutput "🔧 ENVIRONMENT VARIABLES:" -ForegroundColor Yellow
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
    
    # Get worker URL
    Set-Location backend
    try {
        $workerUrl = wrangler deploy --env production --dry-run 2>&1 | Select-String -Pattern "https://.*\.workers\.dev" | ForEach-Object { $_.Matches.Value }
        if ($workerUrl) {
            $healthUrl = "$workerUrl/api/health"
            Write-Info "Testing backend health endpoint: $healthUrl"
            
            try {
                $response = Invoke-RestMethod -Uri $healthUrl -Method GET -TimeoutSec 10
                Write-Success "Backend health check passed!"
                Write-Host "Response: $($response | ConvertTo-Json -Compress)"
            }
            catch {
                Write-Warning "Backend health check failed. May need a few minutes to propagate."
            }
        }
    }
    catch {
        Write-Warning "Could not determine worker URL for testing."
    }
    Set-Location ..
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
    Write-ColorOutput "📋 NEXT STEPS:" -ForegroundColor Green
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