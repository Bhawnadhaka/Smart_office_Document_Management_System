# 🚀 Deployment Guide - Smart Office System

## Free Deployment Options

### ✅ Option 1: Render (Recommended - Easiest)

**Pros**: Free tier, easy setup, supports SQLite, both frontend & backend  
**Cons**: Cold starts after inactivity

#### Steps:

1. **Create Account**
   - Go to https://render.com
   - Sign up with GitHub

2. **Deploy Backend**
   ```
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub repository
   - Name: smartoffice-api
   - Root Directory: server
   - Build Command: npm install
   - Start Command: node index.js
   - Environment Variables:
     * GROK_API_KEY = your_groq_api_key_here
     * GROK_API_URL = https://api.groq.com/openai/v1
     * PORT = 3000
   ```

3. **Deploy Frontend**
   ```
   - Click "New +"
   - Select "Static Site"
   - Connect same repository
   - Name: smartoffice-client
   - Root Directory: client
   - Build Command: npm install && npm run build
   - Publish Directory: dist
   - Environment Variables:
     * VITE_API_URL = [Your backend URL from step 2]
   ```

4. **Update Frontend API URL**
   - After backend deployment, copy the URL (e.g., https://smartoffice-api.onrender.com)
   - Update `client/src/services/api.js`:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
   ```

---

### ✅ Option 2: Railway

**Pros**: Easy Docker deployment, $5 free credit  
**Cons**: Limited free tier

#### Steps:

1. **Create Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy Project**
   ```
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect Node.js
   ```

3. **Add Environment Variables**
   ```
   GROK_API_KEY=your_groq_api_key_here
   GROK_API_URL=https://api.groq.com/openai/v1
   PORT=3000
   ```

4. **Set Start Command**
   ```
   npm run dev
   ```

---

### ✅ Option 3: Vercel (Frontend Only)

**Pros**: Best for React apps, very fast  
**Cons**: Serverless functions for backend (limited)

#### Steps:

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Frontend**
   ```bash
   cd client
   vercel
   ```

3. **For Backend**: Use Render or Railway

---

### ✅ Option 4: Fly.io

**Pros**: Docker-based, good free tier  
**Cons**: Requires Docker knowledge

#### Steps:

1. **Install Fly CLI**
   ```bash
   # PowerShell (Windows)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Login**
   ```bash
   fly auth login
   ```

3. **Deploy**
   ```bash
   fly launch
   ```

---

## 🔧 Pre-Deployment Checklist

- [ ] Test application locally
- [ ] All environment variables set
- [ ] Database initialized with templates
- [ ] API key tested and working
- [ ] Documentation updated
- [ ] Git repository clean

---

## 📝 Environment Variables Required

```env
# Backend (.env)
GROK_API_KEY=your_groq_api_key_here
GROK_API_URL=https://api.groq.com/openai/v1
PORT=3000

# Frontend (optional)
VITE_API_URL=https://your-backend-url.com
```

---

## 🌐 Update API URLs After Deployment

After deploying the backend, update the frontend to use the production API:

**File**: `client/src/services/api.js`

```javascript
// Change from:
const API_URL = 'http://localhost:3000';

// To:
const API_URL = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com';
```

---

## 🚨 Common Deployment Issues

### Issue 1: Database Not Persisting
**Solution**: Some platforms need volume mounting. Add this to your deployment config:
```yaml
volumes:
  - path: /app/server/database
```

### Issue 2: WebSocket Not Working
**Solution**: Ensure your hosting supports WebSocket. Render and Railway do by default.

### Issue 3: Environment Variables Not Loading
**Solution**: Double-check variable names match exactly (case-sensitive).

### Issue 4: Build Fails
**Solution**: Check Node.js version. Update package.json:
```json
"engines": {
  "node": ">=18.0.0"
}
```

---

## 📊 Post-Deployment Testing

1. **Health Check**: Visit `/health` endpoint
2. **Create Document**: Test CRUD operations
3. **Voice Input**: Test microphone permissions
4. **AI Features**: Test all AI endpoints
5. **WebSocket**: Test real-time updates

---

## 💰 Cost Comparison

| Platform | Free Tier | Best For |
|----------|-----------|----------|
| Render | 750 hours/month | Full-stack apps |
| Railway | $5 credit | Quick deployments |
| Vercel | Unlimited | Static sites |
| Fly.io | 3 VMs free | Docker apps |

---

## 🎯 Recommended: Render Deployment

**Why Render?**
- ✅ True free tier (not trial)
- ✅ Supports SQLite
- ✅ Easy GitHub integration
- ✅ WebSocket support
- ✅ Auto-deploy on push
- ✅ HTTPS by default

**Limitations**:
- Cold starts (spins down after 15 min inactivity)
- Limited to 750 hours/month

---

## 📧 Support

If you encounter issues:
1. Check logs in your platform dashboard
2. Verify environment variables
3. Test API endpoints individually
4. Check this guide's troubleshooting section

---

**Ready to deploy!** Start with Render for the easiest experience. 🚀
