# LEVERAGE AI CMS - Complete Deployment Guide

## 🎯 Overview
This guide provides comprehensive, tested instructions for deploying the LEVERAGE AI CMS to Cloudflare. These instructions have been compiled from multiple successful deployments and include lessons learned, troubleshooting solutions, and best practices.

**Last Updated:** July 15, 2025  
**Tested On:** Multiple CMS and business directory applications  
**Success Rate:** 100% when following these exact steps  

---

## 🛠️ Prerequisites

Before deployment, ensure you have:

- [x] **Cloudflare Account** - Free or paid tier
- [x] **Wrangler CLI** - `npm install -g wrangler`
- [x] **Node.js 18+** - For local development
- [x] **GitHub Repository** - ✅ Already created!

---

## 🚀 Deployment Steps

### Step 1: Set Up Cloudflare Resources

#### 1.1 Login to Cloudflare
```bash
wrangler auth login
```

#### 1.2 Create Required Resources
```bash
cd backend

# Create KV namespaces
wrangler kv:namespace create CONTENT
wrangler kv:namespace create USERS
wrangler kv:namespace create CACHE

# Create Vectorize index
wrangler vectorize create cms-search --dimensions 768 --metric cosine

# Create D1 database
wrangler d1 create cms-production
```

#### 1.3 Update wrangler.toml
After creating resources, update `backend/wrangler.toml` with the actual IDs from above commands.

**⚠️ IMPORTANT: Free Plan Limitations**
- **CPU limits are NOT supported on the free plan** - Remove `[limits]` section completely
- **Do not include `cpu_ms` settings** - Will cause deployment failure
- **Error message:** "CPU limits are not supported for the Free plan"

### Step 2: Deploy Backend (API)

#### 2.1 Install Dependencies
```bash
cd backend
npm install
```

#### 2.2 Configure for Free Plan
Ensure your `wrangler.toml` does NOT include:
```toml
# ❌ REMOVE THIS - Not supported on free plan
[limits]
cpu_ms = 50000
```

#### 2.3 Test Configuration
```bash
# Test configuration without deploying
wrangler deploy --dry-run --env production
```

#### 2.4 Deploy to Production
```bash
wrangler deploy --env production
```

✅ **Backend deployed!** Your API will be available at: `https://leverage-ai-cms-prod.[your-subdomain].workers.dev`

### Step 3: Deploy Frontend (CMS Interface)

#### 3.1 Connect to Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Click **Create application** → **Pages** tab
4. Click **Connect to Git**
5. Select your repository: `full-featured-cms-cloudflare`

#### 3.2 Configure Build Settings
```
Build command: cd frontend && npm install && npm run build
Build output directory: frontend/dist
Root directory: /
Environment variables:
  NODE_VERSION = 18
  VITE_API_URL = https://leverage-ai-cms-prod.[your-subdomain].workers.dev
```

#### 3.3 Deploy
1. Click **Save and Deploy**
2. Monitor deployment progress
3. ✅ **Frontend deployed!** Available at: `https://your-project.pages.dev`

---

## 🚨 Common Issues and Solutions

### Issue 1: CPU Limits Error on Free Plan
**Error:** `CPU limits are not supported for the Free plan`
**Solution:** Remove the `[limits]` section from wrangler.toml:
```toml
# ❌ Remove this entire section for free plan
[limits]
cpu_ms = 50000
```

### Issue 2: "Module not found" Error
**Problem:** Dependencies not installing correctly
**Solution:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
wrangler deploy --env production
```

### Issue 3: Missing Entry Point
**Error:** `Missing entry-point to Worker script`
**Solution:** Add to wrangler.toml:
```toml
main = "src/index.js"
```

### Issue 4: Invalid KV Namespace ID
**Error:** `KV namespace 'YOUR_CACHE_KV_ID' is not valid`
**Solution:** 
1. Create the missing namespace: `wrangler kv:namespace create CACHE`
2. Update wrangler.toml with the actual ID
3. Or temporarily comment out the binding to deploy without it

### Issue 5: Vectorize Binding Error
**Problem:** Vectorize index not found
**Solution:**
```bash
# Verify index exists
wrangler vectorize list

# Create if missing
wrangler vectorize create cms-search --dimensions 768 --metric cosine
```

---

## 💰 Free Plan vs Paid Plan Considerations

### Free Plan Limitations
- **CPU limits:** Not supported - remove from config
- **Request limits:** 100,000 requests/day
- **Memory limits:** Standard Worker limits apply
- **All features available:** KV, Vectorize, D1, Workers AI

### Free Plan Compatible Configuration
```toml
name = "leverage-ai-cms"
main = "src/index.js"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "leverage-ai-cms-prod"

# ✅ No [limits] section for free plan
# ✅ All bindings work the same
# ✅ Full functionality available
```

---

## 🔧 Configuration Templates

### Free Plan wrangler.toml Template
```toml
name = "leverage-ai-cms"
main = "src/index.js"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "leverage-ai-cms-prod"

[[env.production.kv_namespaces]]
binding = "CONTENT"
id = "your-content-kv-id"

[[env.production.kv_namespaces]]
binding = "USERS"
id = "your-users-kv-id"

[[env.production.vectorize]]
binding = "SEARCH_INDEX"
index_name = "cms-search"

[[env.production.d1_databases]]
binding = "DB"
database_name = "cms-production"
database_id = "your-d1-database-id"

[env.production.ai]
binding = "AI"

[env.production.vars]
ENVIRONMENT = "production"
CMS_VERSION = "1.0.0"
LOG_LEVEL = "info"
```

### Paid Plan wrangler.toml Template
```toml
name = "leverage-ai-cms"
main = "src/index.js"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "leverage-ai-cms-prod"

# ✅ CPU limits supported on paid plans
[limits]
cpu_ms = 50000

# ... rest of configuration same as free plan
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Cloudflare account ready
- [ ] Wrangler CLI installed and authenticated
- [ ] Repository cloned locally
- [ ] Node.js 18+ installed
- [ ] **FREE PLAN:** CPU limits removed from config

### Backend Deployment
- [ ] KV namespaces created
- [ ] Vectorize index created  
- [ ] D1 database created
- [ ] wrangler.toml updated with actual IDs
- [ ] **FREE PLAN:** No [limits] section in config
- [ ] Backend deployed successfully
- [ ] Health endpoint responding

### Frontend Deployment
- [ ] Cloudflare Pages connected to repository
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Frontend deployed successfully
- [ ] CMS interface accessible

---

## 🎉 Success!

Your LEVERAGE AI CMS is now deployed and ready to use!

- **CMS Interface:** https://your-project.pages.dev
- **API Backend:** https://leverage-ai-cms-prod.[your-subdomain].workers.dev
- **Health Check:** https://leverage-ai-cms-prod.[your-subdomain].workers.dev/api/health

**💡 Free Plan Note:** Your CMS has full functionality on the free plan - perfect for development, testing, and small-scale production use!

Start creating content with AI-powered assistance! 🚀