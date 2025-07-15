# Windows Deployment Instructions

## 🪟 **Windows-Specific Setup**

Since you're on Windows, here are the proper deployment steps:

### **Prerequisites**
1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **PowerShell** - Use Windows PowerShell or PowerShell Core
3. **Cloudflare Account** - Sign up at [cloudflare.com](https://cloudflare.com)

### **Quick Windows Deployment**

#### Option 1: PowerShell Script (Recommended)
```powershell
# Clone your repository
git clone https://github.com/mikeschlottig/full-featured-cms-cloudflare.git
cd full-featured-cms-cloudflare

# Run PowerShell deployment script
PowerShell -ExecutionPolicy Bypass -File deploy.ps1
```

#### Option 2: Manual Step-by-Step

**Step 1: Setup Backend**
```powershell
# Navigate to backend
cd backend

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler auth login

# Create resources
npx wrangler kv:namespace create "CONTENT"
npx wrangler kv:namespace create "USERS"
npx wrangler kv:namespace create "CACHE"
npx wrangler vectorize create cms-search --dimensions=768 --metric=cosine
npx wrangler d1 create cms-production

# Deploy backend
npx wrangler deploy --env production
```

**Step 2: Setup Frontend**
```powershell
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Build frontend
npm run build
```

**Step 3: Deploy Frontend to Cloudflare Pages**
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Workers & Pages → Create application → Pages
3. Connect to Git → Select your repository
4. Configure build settings:
   - **Build command:** `cd frontend && npm install && npm run build`
   - **Build output:** `frontend/dist`
   - **Environment variables:**
     - `NODE_VERSION = 18`
     - `VITE_API_URL = https://leverage-ai-cms-prod.[subdomain].workers.dev`

### **Windows PowerShell Notes**

If you get execution policy errors, run:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or run the script with bypass:
```powershell
PowerShell -ExecutionPolicy Bypass -File deploy.ps1
```

### **Alternative: Use Your Local Directory**

Since you already have the CMS files locally, you can also:

1. **Copy your local CMS files** to the cloned repository
2. **Update the repository** with your specific configurations
3. **Run the deployment script**

### **Windows-Specific Tools**

- **PowerShell ISE** - Good for editing scripts
- **Windows Terminal** - Modern terminal with tabs
- **VS Code** - Excellent for editing the project files

---

## 🔧 **Troubleshooting Windows Issues**

### NPM/Node Issues
```powershell
# Check versions
node --version
npm --version

# Update NPM
npm install -g npm@latest

# Clear NPM cache
npm cache clean --force
```

### Wrangler Issues
```powershell
# Install Wrangler globally
npm install -g wrangler

# Check login status
npx wrangler whoami

# Re-login if needed
npx wrangler auth login
```

### PowerShell Execution Policy
```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy for current user
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

**Ready to deploy? Use the PowerShell script for the easiest Windows deployment experience!**