# LEVERAGE AI CMS - Complete Deployment Guide

## 🎯 Overview
This guide provides step-by-step instructions for deploying the LEVERAGE AI Full-Featured CMS to Cloudflare. The CMS uses a modern architecture with separate frontend and backend deployments.

**Architecture:**
- **Frontend:** React + TypeScript + Vite → Cloudflare Pages
- **Backend:** Cloudflare Workers + AI + Vectorize → Edge Computing

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
npm run create-kv

# Create Vectorize index
npm run create-vectorize

# Create D1 database
npm run create-d1
```

#### 1.3 Update wrangler.toml
After creating resources, update `backend/wrangler.toml` with the actual IDs:
```toml
# Replace placeholders with actual IDs from above commands
[[env.production.kv_namespaces]]
binding = "CONTENT"
id = "YOUR_ACTUAL_CONTENT_KV_ID"

[[env.production.kv_namespaces]]
binding = "USERS"
id = "YOUR_ACTUAL_USERS_KV_ID"

# ... etc
```

### Step 2: Deploy Backend (API)

#### 2.1 Install Dependencies
```bash
cd backend
npm install
```

#### 2.2 Test Locally
```bash
npm run test
# Visit http://localhost:8787/api/health
```

#### 2.3 Deploy to Production
```bash
npm run deploy
```

✅ **Backend deployed!** Your API will be available at: `https://leverage-ai-cms-prod.your-subdomain.workers.dev`

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
  VITE_API_URL = https://leverage-ai-cms-prod.your-subdomain.workers.dev
```

#### 3.3 Deploy
1. Click **Save and Deploy**
2. Monitor deployment progress
3. ✅ **Frontend deployed!** Available at: `https://your-project.pages.dev`

---

## 🔧 Configuration

### Environment Variables

#### Backend (wrangler.toml)
```toml
[env.production.vars]
ENVIRONMENT = "production"
CMS_VERSION = "1.0.0"
LOG_LEVEL = "info"
CORS_ORIGIN = "https://your-project.pages.dev"
```

#### Frontend (.env)
```env
VITE_API_URL=https://leverage-ai-cms-prod.your-subdomain.workers.dev
VITE_APP_NAME=LEVERAGE AI CMS
```

---

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Test health endpoint
curl https://leverage-ai-cms-prod.your-subdomain.workers.dev/api/health

# Test content creation
curl -X POST https://leverage-ai-cms-prod.your-subdomain.workers.dev/api/content \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Article","content":"This is a test article"}'
```

### Frontend Testing
```bash
cd frontend

# Local development
npm run dev
# Visit http://localhost:3000

# Production build test
npm run build
npm run preview
```

---

## 🎯 Available API Endpoints

Base URL: `https://leverage-ai-cms-prod.your-subdomain.workers.dev`

### Content Management
- `GET /api/content` - List all content
- `GET /api/content/:id` - Get specific content
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Search & AI
- `GET /api/search?q=query` - Vector search content
- `POST /api/ai?action=generate` - AI content generation
- `POST /api/ai?action=summarize` - AI content summarization

### System
- `GET /api/health` - Health check
- `GET /api/analytics` - Usage analytics

---

## 🔒 Security

### API Security
- CORS configured for your domain only
- Rate limiting (implement as needed)
- Input validation on all endpoints

### Frontend Security
- Environment variables for sensitive config
- HTTPS enforced by Cloudflare
- CSP headers recommended

---

## 🚨 Troubleshooting

### Common Issues

#### Backend Deployment Fails
```bash
# Clear cache and retry
wrangler dev --clear-cache
wrangler deploy --env production

# Check logs
wrangler tail
```

#### Frontend Build Fails
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Database Connection Issues
```bash
# Verify resources exist
wrangler kv:namespace list
wrangler vectorize list
wrangler d1 list

# Check wrangler.toml configuration
```

### Performance Optimization

#### Backend
- Use KV for caching frequently accessed content
- Implement smart caching strategies
- Monitor Worker CPU usage

#### Frontend
- Enable Cloudflare's optimization features
- Use code splitting for large bundles
- Optimize images and assets

---

## 📊 Monitoring

### Cloudflare Analytics
- Monitor in Cloudflare Dashboard
- Set up alerts for errors/performance
- Track usage patterns

### Custom Monitoring
```bash
# View real-time logs
wrangler tail

# Check health endpoint
curl https://leverage-ai-cms-prod.your-subdomain.workers.dev/api/health
```

---

## 🔄 Updates and Maintenance

### Backend Updates
```bash
cd backend
# Make changes to src/index.js
wrangler deploy --env production
```

### Frontend Updates
```bash
cd frontend
# Make changes to src/
git add . && git commit -m "Update: description"
git push origin main
# Cloudflare Pages auto-deploys
```

---

## ✅ Deployment Checklist

### Pre-Deployment
- [ ] Cloudflare account ready
- [ ] Wrangler CLI installed and authenticated
- [ ] Repository cloned locally
- [ ] Node.js 18+ installed

### Backend Deployment
- [ ] KV namespaces created
- [ ] Vectorize index created  
- [ ] D1 database created
- [ ] wrangler.toml updated with actual IDs
- [ ] Backend deployed successfully
- [ ] Health endpoint responding

### Frontend Deployment
- [ ] Cloudflare Pages connected to repository
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Frontend deployed successfully
- [ ] CMS interface accessible

### Post-Deployment
- [ ] End-to-end testing completed
- [ ] API endpoints working
- [ ] Frontend connecting to backend
- [ ] Search functionality working
- [ ] AI features operational

---

## 🎉 Success!

Your LEVERAGE AI CMS is now deployed and ready to use!

- **CMS Interface:** https://your-project.pages.dev
- **API Backend:** https://leverage-ai-cms-prod.your-subdomain.workers.dev
- **Health Check:** https://leverage-ai-cms-prod.your-subdomain.workers.dev/api/health

Start creating content with AI-powered assistance! 🚀