# LEVERAGE AI - Quick Reference Deployment Cards

## 🚀 5-Minute Cloudflare Deployment

### Method 1: GitHub Pages (Recommended)
```bash
# 1. Create GitHub repo
gh repo create my-project --public

# 2. Push code
git add . && git commit -m "Initial commit"
git push origin main

# 3. Connect to Cloudflare Pages
# Visit dash.cloudflare.com → Pages → Connect Git
```

### Method 2: Direct Workers
```bash
# 1. Init project
wrangler init my-worker

# 2. Configure wrangler.toml
# 3. Deploy
wrangler deploy
```

---

## 📋 Essential File Templates

### wrangler.toml Template
```toml
name = "PROJECT_NAME"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
name = "PROJECT_NAME-prod"

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your-kv-id"

[env.production.ai]
binding = "AI"

[env.production.vars]
ENVIRONMENT = "production"
```

### package.json Template
```json
{
  "name": "PROJECT_NAME",
  "version": "1.0.0",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy --env production"
  },
  "dependencies": {
    "@cloudflare/workers-types": "^4.20241022.0"
  },
  "devDependencies": {
    "wrangler": "^3.78.12"
  }
}
```
---

## 🔧 Emergency Troubleshooting

### Deployment Failed?
```bash
# Clear cache and retry
wrangler dev --clear-cache
wrangler deploy

# Check logs
wrangler tail
```

### Can't Access Application?
1. Check Cloudflare DNS settings
2. Verify SSL certificate
3. Check custom domain configuration
4. Review routing rules

### Database Connection Issues?
```bash
# Verify bindings
wrangler kv:namespace list
wrangler vectorize list

# Test connections
wrangler dev --local
```

---

## ⚡ Speed Commands

```bash
# Full deployment pipeline
git add . && git commit -m "Deploy" && git push
# (Cloudflare auto-deploys)

# Quick worker update
wrangler deploy

# Local testing
wrangler dev

# View live logs
wrangler tail

# Emergency rollback
# Use Cloudflare dashboard → Deployments → Rollback
```

---

## 🎯 Project Types Quick Setup

### CMS Project
- KV Storage: ✅ Required
- Vectorize: ✅ Required  
- D1 Database: ✅ Required
- Workers AI: ✅ Required

### Static Website
- Pages: ✅ Required
- KV Storage: ⚪ Optional
- Functions: ⚪ Optional

### API Only
- Workers: ✅ Required
- Database: ✅ Required
- Authentication: ⚪ Optional

---

**📖 For complete instructions, see: Complete-Cloudflare-Deployment-Guide.md**