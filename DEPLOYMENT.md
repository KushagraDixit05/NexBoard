# NexBoard Deployment Guide

This guide will help you deploy NexBoard to Vercel (frontend) and Railway (backend) for your college project.

## Prerequisites

- [x] GitHub account
- [ ] Vercel account (sign up at https://vercel.com - use GitHub login)
- [ ] Railway account (sign up at https://railway.app - use GitHub login)
- [ ] MongoDB Atlas account (sign up at https://www.mongodb.com/cloud/atlas)

---

## Step 1: Set Up MongoDB Atlas (Database)

### 1.1 Create Free Cluster

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a new project (e.g., "NexBoard")
4. Click **"Build a Database"**
5. Choose **"FREE"** (M0 Sandbox)
6. Select a cloud provider (AWS recommended) and region closest to you
7. Cluster Name: `nexboard-cluster`
8. Click **"Create"**

### 1.2 Configure Database Access

1. In the Security section, click **"Database Access"**
2. Click **"Add New Database User"**
3. Username: `nexboard_user`
4. Password: Click "Autogenerate Secure Password" and **SAVE IT**
5. Database User Privileges: **"Read and write to any database"**
6. Click **"Add User"**

### 1.3 Configure Network Access

1. Click **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, restrict to specific IPs
4. Click **"Confirm"**

### 1.4 Get Connection String

1. Click **"Database"** in the left sidebar
2. Click **"Connect"** on your cluster
3. Click **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://nexboard_user:<password>@nexboard-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: change to `/nexboard?retryWrites=true&w=majority`

**Final format:**
```
mongodb+srv://nexboard_user:YOUR_PASSWORD@nexboard-cluster.xxxxx.mongodb.net/nexboard?retryWrites=true&w=majority
```

---

## Step 2: Deploy Backend to Railway

### 2.1 Push to GitHub

```bash
cd /media/kushagra/crucial/NexBoard
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2.2 Deploy on Railway

1. Go to https://railway.app
2. Sign in with GitHub
3. Click **"New Project"**
4. Click **"Deploy from GitHub repo"**
5. Select your **NexBoard** repository
6. Railway will detect the project

### 2.3 Configure Backend Service

1. Click **"Add variables"** or go to the **Variables** tab
2. Add these environment variables:

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://nexboard_user:YOUR_PASSWORD@nexboard-cluster.xxxxx.mongodb.net/nexboard?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-string-change-this-to-something-secure-abc123xyz
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=another-random-secret-string-for-refresh-tokens-xyz789abc
REFRESH_TOKEN_EXPIRES_IN=7d
CORS_ORIGIN=https://your-app-name.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

⚠️ **Important**: 
- Replace JWT secrets with random strings
- Update CORS_ORIGIN after deploying frontend
- SMTP is optional for college demo

### 2.4 Configure Build Settings

1. Go to **Settings** → **Build**
2. **Root Directory**: `/server`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Click **"Deploy"**

### 2.5 Get Backend URL

1. Once deployed, go to **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copy the URL (e.g., `https://nexboard-backend.railway.app`)
4. **Save this URL** - you'll need it for frontend

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Deploy to Vercel

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your **NexBoard** repository
5. Vercel will auto-detect Next.js

### 3.2 Configure Build Settings

**Framework Preset**: Next.js
**Root Directory**: `client`
**Build Command**: `npm run build`
**Output Directory**: `.next`
**Install Command**: `npm install`

### 3.3 Add Environment Variables

Click **"Environment Variables"** and add:

```env
NEXT_PUBLIC_API_URL=https://nexboard-backend.railway.app/api
```

Replace `nexboard-backend.railway.app` with your actual Railway URL.

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (~2-3 minutes)
3. You'll get a URL like `https://nexboard.vercel.app`

---

## Step 4: Update CORS Settings

### 4.1 Update Backend CORS

1. Go back to **Railway**
2. Go to **Variables**
3. Update `CORS_ORIGIN` to your Vercel URL:
   ```
   CORS_ORIGIN=https://nexboard.vercel.app
   ```
4. Click **"Deploy"** to restart with new settings

---

## Step 5: Test Your Deployment

### 5.1 Test Backend

Visit: `https://your-backend-url.railway.app/api/health`

Should return:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 5.2 Test Frontend

1. Visit your Vercel URL
2. Try to sign up/login
3. Create a test project
4. Verify features work

---

## Troubleshooting

### Backend Issues

**Problem**: MongoDB connection failed
- Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
- Verify connection string password
- Check if MongoDB user has correct permissions

**Problem**: CORS errors
- Verify CORS_ORIGIN matches your Vercel URL exactly
- Include https:// in the URL
- Redeploy backend after changing CORS_ORIGIN

### Frontend Issues

**Problem**: API calls failing
- Check NEXT_PUBLIC_API_URL is correct
- Test backend health endpoint
- Check browser console for errors

**Problem**: Build fails on Vercel
- Check that Root Directory is set to `client`
- Verify all dependencies are in package.json
- Check build logs for specific errors

---

## Free Tier Limits

### MongoDB Atlas Free Tier (M0)
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Good for demos/college projects

### Railway Free Tier
- ✅ $5 credit/month
- ✅ ~500 hours runtime
- ⚠️ May need to add payment method (won't be charged if under $5)

### Vercel Free Tier
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth
- ✅ Perfect for college projects

---

## Quick Reference

### Railway CLI (Optional)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# View logs
railway logs

# Open dashboard
railway open
```

### Vercel CLI (Optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd client && vercel

# View logs
vercel logs
```

---

## Security Notes for College Project

✅ **Good enough for demo**:
- MongoDB Atlas with 0.0.0.0/0 access
- Environment variables in Railway/Vercel
- HTTPS enabled by default

⚠️ **For real production**, you'd need:
- Restricted IP access
- Secrets manager
- Rate limiting
- Input validation
- Security headers
- Regular backups

---

## Submission Checklist

- [ ] Backend deployed to Railway
- [ ] Frontend deployed to Vercel
- [ ] MongoDB Atlas configured
- [ ] Can sign up/login
- [ ] Can create projects
- [ ] Can create tasks
- [ ] All features working
- [ ] URLs documented for submission

---

## URLs for Submission

**Frontend (Public URL)**: https://your-app.vercel.app
**Backend API**: https://your-backend.railway.app
**Repository**: https://github.com/your-username/NexBoard

---

Need help? Common commands:

```bash
# Local development
npm run dev

# Build locally
npm run build

# Start production build locally
cd client && npm start
```

Good luck with your college project! 🚀
