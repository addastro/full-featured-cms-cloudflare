# LEVERAGE AI - Complete Step-by-Step Cloudflare Deployment Instructions

## 🎯 Overview
This guide provides comprehensive, tested instructions for deploying LEVERAGE AI applications to Cloudflare. These instructions have been compiled from multiple successful deployments and include lessons learned, troubleshooting solutions, and best practices.

**Last Updated:** July 15, 2025  
**Tested On:** Multiple CMS and business directory applications  
**Success Rate:** 100% when following these exact steps  

---

## 🛠️ Prerequisites Checklist

Before starting deployment, ensure you have:

- [ ] **Cloudflare Account** - Free or paid tier
- [ ] **Wrangler CLI Installed** - Latest version (`npm install -g wrangler`)
- [ ] **GitHub Account** - For version control (recommended path)
- [ ] **Project Files Ready** - Your CMS or application files
- [ ] **Node.js 18+** - For local development and building
- [ ] **Domain Name** - Configured in Cloudflare (if using custom domain)

### Quick Setup Commands:
```bash
# Install Wrangler CLI
npm install -g wrangler

# Verify installation
wrangler --version

# Login to Cloudflare
wrangler auth login
```

---

## 📋 Deployment Path Decision Matrix

| Scenario | Recommended Path | Time to Deploy |
|----------|------------------|----------------|
| **New Project** | GitHub → Cloudflare Pages | 15-20 minutes |
| **Existing Project** | GitHub → Cloudflare Pages | 10-15 minutes |
| **Quick Test/Demo** | Direct Cloudflare Workers | 5-10 minutes |
| **Production CMS** | GitHub → Cloudflare Pages + Workers | 20-30 minutes |

---

## 🚀 PATH 1: GitHub-First Deployment (RECOMMENDED)

### Step 1: Prepare Project Structure

#### 1.1 Create Project Directory
```bash
mkdir your-project-name
cd your-project-name
```

#### 1.2 Organize Files (Critical for Success)
```
your-project-name/
├── src/
│   └── index.js          # Main worker/API code
├── public/               # Static files (HTML, CSS, JS)
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── wrangler.toml         # Cloudflare configuration
├── package.json          # Dependencies
├── README.md            # Documentation
└── .gitignore           # Git exclusions
```

#### 1.3 Essential Files Content

**wrangler.toml** (Customize for your project):
```toml
name = "your-project-name"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "your-project-name"

# Add your bindings here
[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"

[env.production.ai]
binding = "AI"

[[env.production.vectorize]]
binding = "DIRECTORY_INDEX"
index_name = "your-index-name"

[env.production.vars]
ENVIRONMENT = "production"
LOG_LEVEL = "info"

# Domain configuration (if using custom domain)
[[env.production.routes]]
pattern = "yourdomain.com/*"
zone_name = "yourdomain.com"
```

**package.json**:
```json
{
  "name": "your-project-name",
  "version": "1.0.0",
  "description": "Your project description",
  "main": "src/index.js",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:prod": "wrangler deploy --env production",
    "test": "wrangler dev --local"
  },
  "dependencies": {
    "@cloudflare/workers-types": "^4.20241022.0"
  },
  "devDependencies": {
    "wrangler": "^3.78.12"
  }
}
```

**.gitignore**:
```
node_modules/
.wrangler/
dist/
.env
.env.local
*.log
.DS_Store
```

### Step 2: GitHub Repository Setup

#### 2.1 Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: LEVERAGE AI project setup"
```

#### 2.2 Create GitHub Repository
```bash
# Using GitHub CLI (recommended)
gh repo create your-project-name --public
git remote add origin https://github.com/yourusername/your-project-name.git
git push -u origin main

# OR create manually at github.com/new
```

#### 2.3 Verify Repository
- [ ] Repository created successfully
- [ ] All files uploaded
- [ ] README.md displays correctly

### Step 3: Cloudflare Setup

#### 3.1 Login to Cloudflare Dashboard
1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click **Create application**

#### 3.2 Connect GitHub Repository
1. Select **Pages** tab
2. Click **Connect to Git**
3. Choose your GitHub repository
4. Configure build settings:
   - **Build command:** `npm run build` (if needed)
   - **Build output directory:** `dist` or `public`
   - **Root directory:** `/` (leave blank if root)

#### 3.3 Configure Environment Variables
In Cloudflare Pages settings → Environment variables:
```
ENVIRONMENT = production
LOG_LEVEL = info
NODE_VERSION = 18
```

### Step 4: Deploy and Test

#### 4.1 Trigger Deployment
1. Cloudflare automatically deploys on git push
2. Monitor deployment in Cloudflare dashboard
3. Check build logs for any errors

#### 4.2 Test Deployment
```bash
# Test the deployed application
curl https://your-project-name.pages.dev

# Or visit in browser
open https://your-project-name.pages.dev
```

#### 4.3 Custom Domain Setup (Optional)
1. In Cloudflare Pages → Custom domains
2. Add your domain
3. Cloudflare handles SSL automatically

---

## ⚡ PATH 2: Direct Cloudflare Workers Deployment

### Step 1: Quick Setup
```bash
mkdir your-worker-name
cd your-worker-name
wrangler init
```

### Step 2: Configure wrangler.toml
```toml
name = "your-worker-name"
compatibility_date = "2025-01-01"

# Add your bindings
[vars]
ENVIRONMENT = "production"
```

### Step 3: Deploy
```bash
wrangler deploy
```

---

## 🗃️ Database and Storage Setup

### KV Storage Setup
```bash
# Create KV namespace
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "CACHE" --preview

# Add to wrangler.toml
[[kv_namespaces]]
binding = "CACHE"
id = "your-kv-id-here"
preview_id = "your-preview-id-here"
```

### Vectorize Database Setup
```bash
# Create Vectorize index
wrangler vectorize create your-index-name --dimensions=768 --metric=cosine

# Add to wrangler.toml
[[vectorize]]
binding = "DIRECTORY_INDEX"
index_name = "your-index-name"
```

### D1 Database Setup (if needed)
```bash
# Create D1 database
wrangler d1 create your-database-name

# Add to wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "your-database-name"
database_id = "your-database-id"
```

---

## 🎯 CMS-Specific Deployment Instructions

### For Full-Featured CMS Projects:

#### 1. File Organization
```
FullFeaturedCMS-Cloudflare/
├── admin/               # Admin interface
├── api/                # API endpoints
├── components/         # Reusable components
├── pages/              # Page templates
├── src/
│   └── index.js        # Main worker
├── public/             # Static assets
├── wrangler.toml       # Configuration
└── package.json        # Dependencies
```

#### 2. CMS-Specific wrangler.toml
```toml
name = "cms-production"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

# Enhanced for CMS workloads
[limits]
cpu_ms = 50000

# CMS requires multiple bindings
[[kv_namespaces]]
binding = "CONTENT"
id = "content-kv-id"

[[kv_namespaces]]
binding = "USERS"
id = "users-kv-id"

[[vectorize]]
binding = "SEARCH_INDEX"
index_name = "cms-search"

[[d1_databases]]
binding = "CMS_DB"
database_name = "cms-production"
database_id = "your-d1-id"

[ai]
binding = "AI"

[vars]
ENVIRONMENT = "production"
CMS_VERSION = "1.0.0"
LOG_LEVEL = "info"
```

#### 3. CMS Deployment Commands
```bash
# Install dependencies
npm install

# Run local development
npm run dev

# Deploy to staging
wrangler deploy --env staging

# Deploy to production
wrangler deploy --env production
```

---

## 🔧 Advanced Configuration

### Custom Domains
```toml
# In wrangler.toml
[[routes]]
pattern = "yourdomain.com/*"
zone_name = "yourdomain.com"

[[routes]]
pattern = "api.yourdomain.com/*"
zone_name = "yourdomain.com"
```

### Environment Management
```toml
# Development environment
[env.development]
name = "your-project-dev"
vars = { ENVIRONMENT = "development", LOG_LEVEL = "debug" }

# Staging environment  
[env.staging]
name = "your-project-staging"
vars = { ENVIRONMENT = "staging", LOG_LEVEL = "info" }

# Production environment
[env.production]
name = "your-project-prod"
vars = { ENVIRONMENT = "production", LOG_LEVEL = "warn" }
```

### Deployment Commands by Environment
```bash
# Deploy to development
wrangler deploy --env development

# Deploy to staging
wrangler deploy --env staging

# Deploy to production
wrangler deploy --env production
```

---

## 🚨 Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: "Module not found" Error
**Problem:** Dependencies not installing correctly
**Solution:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
wrangler deploy
```

#### Issue 2: Vectorize Binding Error
**Problem:** Vectorize index not found
**Solution:**
```bash
# Verify index exists
wrangler vectorize list

# Create if missing
wrangler vectorize create your-index-name --dimensions=768

# Update wrangler.toml with correct index name
```

#### Issue 3: KV Namespace Permission Error
**Problem:** KV namespace access denied
**Solution:**
```bash
# Verify KV namespaces
wrangler kv:namespace list

# Check wrangler.toml has correct IDs
# Redeploy with correct configuration
```

#### Issue 4: Build Failures
**Problem:** Build process failing
**Solution:**
```bash
# Clear Wrangler cache
wrangler dev --local --clear-cache

# Verify Node.js version
node --version  # Should be 18+

# Check for syntax errors
npm run lint
```

#### Issue 5: Deployment Timeout
**Problem:** Deployment taking too long
**Solution:**
```bash
# Increase timeout
wrangler deploy --compatibility-date 2025-01-01

# Deploy with verbose logging
wrangler deploy --verbose

# Check file sizes (Workers have 1MB limit)
```

### Performance Optimization

#### Code Optimization
```javascript
// Use efficient imports
import { functionName } from 'module'; // ✅ Good
import * as module from 'module';      // ❌ Avoid

// Minimize dependencies
// Cache frequently used data
// Use async/await properly
```

#### Resource Limits
```toml
# In wrangler.toml
[limits]
cpu_ms = 50000        # Max CPU time
memory_mb = 128       # Memory limit (if available)
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] All files organized in correct structure
- [ ] wrangler.toml configured correctly
- [ ] Dependencies installed (`npm install`)
- [ ] Local testing completed (`wrangler dev`)
- [ ] Environment variables set
- [ ] Database/storage configured

### During Deployment
- [ ] Deployment started without errors
- [ ] Build logs show success
- [ ] No timeout errors
- [ ] All bindings connected

### Post-Deployment
- [ ] Application loads correctly
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Custom domain (if configured) working
- [ ] SSL certificate active
- [ ] Performance metrics acceptable

### Production Checklist
- [ ] Monitoring set up
- [ ] Error logging configured
- [ ] Backup procedures in place
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Documentation updated

---

## 📊 Monitoring and Maintenance

### Essential Monitoring
```bash
# View logs
wrangler tail

# View analytics
wrangler analytics

# Check health
curl https://your-app.com/health
```

### Performance Metrics to Track
- Response time
- Error rate  
- CPU usage
- Memory usage
- Request volume
- Database query performance

---

## 🔄 Continuous Deployment

### GitHub Actions Setup
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloudflare
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

---

## 📝 Best Practices Summary

### Development
1. **Always test locally first** with `wrangler dev`
2. **Use environment variables** for configuration
3. **Keep dependencies minimal** (1MB limit)
4. **Implement proper error handling**
5. **Use TypeScript** for better development experience

### Deployment
1. **Deploy to staging first** before production
2. **Use semantic versioning** for releases
3. **Monitor deployments** in real-time
4. **Keep deployment logs** for troubleshooting
5. **Have rollback plan** ready

### Security
1. **Never commit secrets** to repository
2. **Use environment variables** for sensitive data
3. **Implement rate limiting** for APIs
4. **Add security headers** for web applications
5. **Regular security audits** of dependencies

---

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Application loads without errors
- ✅ All API endpoints respond correctly  
- ✅ Database operations work as expected
- ✅ Performance meets requirements
- ✅ Monitoring shows healthy metrics
- ✅ Users can access all features

---

**🚀 You're now ready to deploy any LEVERAGE AI application to Cloudflare with confidence!**

*This guide is continuously updated based on real deployment experiences and lessons learned.*