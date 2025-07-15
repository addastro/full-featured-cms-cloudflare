# LEVERAGE AI - Full-Featured CMS

🚀 **AI-Powered Content Management System with Cloudflare Deployment**

## 🎯 Architecture Overview

This CMS follows a modern, scalable architecture:

- **Frontend:** React + TypeScript + Vite → Cloudflare Pages
- **Backend:** Cloudflare Workers + AI + Vectorize → Edge Computing
- **Database:** Cloudflare KV + Vectorize + D1 → Distributed Storage
- **AI Features:** Content generation, vector search, analytics

## 📁 Project Structure

```
full-featured-cms-cloudflare/
├── backend/                 # ⚡ Cloudflare Workers API
│   ├── src/index.js         # Complete CMS API with AI & vector search
│   ├── wrangler.toml        # Cloudflare configuration
│   └── package.json         # Dependencies & deployment scripts
├── frontend/                # ⚛️ React + TypeScript CMS Interface
│   ├── package.json         # React dependencies
│   ├── vite.config.ts       # Vite build configuration
│   └── tsconfig.json        # TypeScript configuration
├── docs/                    # 📚 Complete documentation
│   ├── deployment-guide.md  # Step-by-step deployment instructions
│   └── windows-deployment.md # Windows-specific instructions
├── deploy.ps1               # 🪟 Windows PowerShell deployment script
├── deploy.sh                # 🐧 Linux/Mac deployment script
└── README.md                # 📋 This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Cloudflare account** - [Sign up free](https://cloudflare.com)
- **Git** - For cloning the repository

### 🪟 Windows Deployment (PowerShell)
```powershell
# Clone the repository
git clone https://github.com/mikeschlottig/full-featured-cms-cloudflare.git
cd full-featured-cms-cloudflare

# Run automated deployment
PowerShell -ExecutionPolicy Bypass -File deploy.ps1
```

### 🐧 Linux/Mac Deployment (Bash)
```bash
# Clone the repository
git clone https://github.com/mikeschlottig/full-featured-cms-cloudflare.git
cd full-featured-cms-cloudflare

# Run automated deployment
chmod +x deploy.sh
./deploy.sh
```

### Manual Deployment
Follow platform-specific guides:
- **Windows:** [docs/windows-deployment.md](./docs/windows-deployment.md)
- **All Platforms:** [docs/deployment-guide.md](./docs/deployment-guide.md)

## 🎯 Features

### ✅ Content Management
- Rich markdown editor with live preview
- AI-powered content generation
- Template system for rapid content creation
- Media management and optimization
- Version control and revision history

### ✅ AI Integration
- Content generation with Cloudflare Workers AI
- Vector search for intelligent content discovery
- SEO optimization suggestions
- Automated tagging and categorization

### ✅ Performance
- Edge computing with Cloudflare Workers
- Global CDN distribution
- Sub-100ms response times
- Automatic scaling

### ✅ Developer Experience
- TypeScript throughout
- Modern React with hooks
- Comprehensive testing
- CI/CD with GitHub Actions

## 📖 Documentation

- [🪟 Windows Deployment Guide](./docs/windows-deployment.md) - **Start here for Windows**
- [📋 Complete Deployment Guide](./docs/deployment-guide.md)
- [🔧 API Documentation](./docs/api-documentation.md)
- [🚨 Troubleshooting Guide](./docs/troubleshooting.md)

## 🏗️ Deployment Status

Your next steps:
- [ ] Clone this repository locally
- [ ] Run the deployment script for your platform
- [ ] Configure Cloudflare resources
- [ ] Deploy backend Workers API
- [ ] Deploy frontend to Cloudflare Pages
- [ ] Test and launch! 🎉

## 🔧 Environment Variables

```env
# Backend (Cloudflare Workers)
ENVIRONMENT=production
LOG_LEVEL=info
CMS_VERSION=1.0.0

# Frontend (Build-time)
VITE_API_URL=https://your-api.workers.dev
VITE_APP_NAME=LEVERAGE AI CMS
```

## 🎛️ Expected URLs After Deployment

- **🎨 CMS Interface:** `https://your-cms.pages.dev`
- **⚡ API Backend:** `https://leverage-ai-cms-prod.[subdomain].workers.dev`
- **🔍 Health Check:** `https://leverage-ai-cms-prod.[subdomain].workers.dev/api/health`

## 🚀 API Endpoints

Base URL: `https://leverage-ai-cms-prod.[subdomain].workers.dev`

### Content Management
- `GET /api/content` - List all content
- `POST /api/content` - Create new content
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### AI & Search
- `GET /api/search?q=query` - Vector search
- `POST /api/ai?action=generate` - AI content generation
- `POST /api/ai?action=summarize` - AI summarization

### System
- `GET /api/health` - Health check
- `GET /api/analytics` - Usage analytics

## ⚡ Quick Commands

```powershell
# Windows - Backend only
PowerShell -ExecutionPolicy Bypass -File deploy.ps1 backend

# Windows - Frontend only  
PowerShell -ExecutionPolicy Bypass -File deploy.ps1 frontend

# Windows - Test deployment
PowerShell -ExecutionPolicy Bypass -File deploy.ps1 test
```

## 🛠️ Development

### Backend Development
```powershell
cd backend
npm install
npm run dev     # Local development server
npm run deploy  # Deploy to Cloudflare
```

### Frontend Development
```powershell
cd frontend
npm install
npm run dev     # Local development server
npm run build   # Build for production
```

## 🤝 Contributing

This is a LEVERAGE AI internal project. See deployment documentation for development workflows.

## 📄 License

Proprietary - LEVERAGE AI

---

## 🎉 Ready to Deploy?

**🪟 Windows Users:** Start with the [Windows Deployment Guide](./docs/windows-deployment.md)

**🐧 Linux/Mac Users:** Use the automated `deploy.sh` script

Your AI-powered CMS is just minutes away! 🚀