# Production Environment Setup Guide

## 🎯 Overview

This guide provides step-by-step instructions for configuring environment variables on your deployed NexBoard application.

**Deployment URLs:**
- **Frontend (Vercel)**: https://nex-board-client.vercel.app
- **Backend (Railway)**: https://nexboard-server-production-6f0b.up.railway.app

---

## 📋 Quick Reference

### Frontend Environment Variable
| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://nexboard-server-production-6f0b.up.railway.app/api` |

### Backend Environment Variables
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `https://nex-board-client.vercel.app` |
| `FRONTEND_URL` | `https://nex-board-client.vercel.app` |
| `BACKEND_URL` | `https://nexboard-server-production-6f0b.up.railway.app` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | (Use existing from `.env`) |
| `REFRESH_TOKEN_SECRET` | (Use existing from `.env`) |
| `GOOGLE_CLIENT_ID` | (Use existing from `.env`) |
| `GOOGLE_CLIENT_SECRET` | (Use existing from `.env`) |

---

## 🚀 Step-by-Step Deployment

### Step 1: Configure Vercel (Frontend)

1. **Login to Vercel**: https://vercel.com/dashboard
2. **Navigate to your project**: "nex-board-client"
3. **Go to Settings** → **Environment Variables**
4. **Add Production Variable**:
   - **Key**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://nexboard-server-production-6f0b.up.railway.app/api`
   - **Environment**: Check "Production"
5. **Click "Save"**
6. **Redeploy** (Vercel may auto-deploy, or go to Deployments → Click "..." → Redeploy)

#### Alternative: Use the .env.production file
You can also copy the value from `/client/.env.production` file in your repository.

---

### Step 2: Configure Railway (Backend)

1. **Login to Railway**: https://railway.app/dashboard
2. **Navigate to your project**: "nexboard-server-production-6f0b"
3. **Click on the service** (backend/server)
4. **Go to "Variables" tab**
5. **Click "Raw Editor"** (top right)
6. **Paste the following** (update MongoDB URI):

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas Connection String
# ⚠️ REPLACE WITH YOUR ACTUAL CONNECTION STRING
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nexboard?retryWrites=true&w=majority

# JWT Secrets (copy from your local .env file)
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS and URL Configuration
CORS_ORIGIN=https://nex-board-client.vercel.app
FRONTEND_URL=https://nex-board-client.vercel.app
BACKEND_URL=https://nexboard-server-production-6f0b.up.railway.app

# Google OAuth Configuration
# ⚠️ IMPORTANT: Use your actual Google OAuth credentials from Google Cloud Console
GOOGLE_CLIENT_ID=your-google-client-id-from-cloud-console.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-from-cloud-console

# Email Configuration (Optional - if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload Configuration
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

7. **Update the secrets**:
   - Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
   - Copy `JWT_SECRET` and `REFRESH_TOKEN_SECRET` from your local `/server/.env` file
   - Update SMTP credentials if you're using email features

8. **Click "Update Variables"** (Railway will auto-redeploy)

#### Alternative: Use the .env.production file
You can also reference `/server/.env.production` file in your repository for the complete configuration.

---

### Step 3: Update Google OAuth Configuration

⚠️ **CRITICAL**: You must update the OAuth redirect URIs in Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/apis/credentials
2. **Select your project** (or create one if you haven't)
3. **Click on your OAuth 2.0 Client ID**
4. **Under "Authorized redirect URIs"**, add:
   ```
   https://nexboard-server-production-6f0b.up.railway.app/api/auth/google/callback
   ```
5. **Keep the existing development URI** (if you want local development to work):
   ```
   http://localhost:5000/api/auth/google/callback
   ```
6. **Click "Save"**

> **Note**: It may take a few minutes for changes to propagate.

---

### Step 4: MongoDB Atlas Configuration

If you haven't already configured MongoDB Atlas:

1. **Login to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Navigate to your cluster** → **Connect**
3. **Select "Connect your application"**
4. **Copy the connection string**:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Modify the connection string**:
   - Replace `<password>` with your actual database user password
   - Add `/nexboard` before the `?` to specify the database name:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nexboard?retryWrites=true&w=majority
   ```
6. **Update on Railway**: Paste this value as `MONGODB_URI`

#### Network Access Configuration
Make sure your MongoDB Atlas cluster allows connections from Railway:
1. **Database Access** → **Network Access**
2. **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
3. **Confirm**

---

### Step 5: Verify Deployment

After configuring environment variables and redeploying, verify everything works:

#### 1. Backend Health Check
**URL**: https://nexboard-server-production-6f0b.up.railway.app/api/health

**Expected Response**:
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Test using curl**:
```bash
curl https://nexboard-server-production-6f0b.up.railway.app/api/health
```

#### 2. Frontend Loads
**URL**: https://nex-board-client.vercel.app

**Expected**: Login page should load without errors

#### 3. CORS Verification
Open browser DevTools (F12) → Network tab → Try to login/signup

**Look for**:
- API requests to `https://nexboard-server-production-6f0b.up.railway.app/api/...`
- No CORS errors in console
- Response headers include `Access-Control-Allow-Origin: https://nex-board-client.vercel.app`

#### 4. Test Authentication Flow
1. **Sign up** with a new account
2. **Verify** you receive a success response
3. **Login** with the created account
4. **Check** that you're redirected to the dashboard

#### 5. Test OAuth Login
1. Click "Sign in with Google"
2. Complete the OAuth flow
3. Verify you're redirected back to the frontend with authentication

---

## 🐛 Troubleshooting

### Issue: "CORS policy" error in browser console

**Symptoms**: 
```
Access to XMLHttpRequest at 'https://nexboard-server-production-6f0b.up.railway.app/api/...' 
from origin 'https://nex-board-client.vercel.app' has been blocked by CORS policy
```

**Solution**:
1. Check `CORS_ORIGIN` on Railway matches your Vercel URL **exactly** (including `https://`)
2. Ensure there are no trailing slashes
3. Redeploy Railway after updating

---

### Issue: "Network Error" or API calls failing

**Symptoms**: API requests timeout or return network errors

**Solution**:
1. Verify `NEXT_PUBLIC_API_URL` on Vercel is correct
2. Test backend health endpoint directly: `curl https://nexboard-server-production-6f0b.up.railway.app/api/health`
3. Check Railway logs for errors: Railway Dashboard → Your Service → Logs

---

### Issue: "MongoServerError" or database connection failed

**Symptoms**: Backend health check shows `"database": "disconnected"` or errors in Railway logs

**Solution**:
1. Verify `MONGODB_URI` connection string format is correct
2. Check database user password is correct (no special characters needing URL encoding)
3. Verify MongoDB Atlas Network Access allows 0.0.0.0/0
4. Test connection string locally: 
   ```bash
   mongosh "mongodb+srv://username:password@cluster.mongodb.net/nexboard"
   ```

---

### Issue: OAuth login fails or redirects incorrectly

**Symptoms**: Google login button doesn't work or redirects to wrong URL

**Solution**:
1. Verify `BACKEND_URL` on Railway is set to `https://nexboard-server-production-6f0b.up.railway.app`
2. Verify `FRONTEND_URL` on Railway is set to `https://nex-board-client.vercel.app`
3. Check Google Cloud Console redirect URIs include the production backend URL
4. Wait 5-10 minutes for Google OAuth changes to propagate

---

### Issue: Build fails on Vercel

**Symptoms**: Vercel deployment fails during build

**Solution**:
1. Check **Root Directory** is set to `client` in Vercel project settings
2. Review build logs in Vercel dashboard for specific errors
3. Verify `package.json` and `next.config.js` are correct
4. Check environment variables are set before building

---

### Issue: Build fails on Railway

**Symptoms**: Railway deployment fails during build

**Solution**:
1. Check **Root Directory** is set to `server` in Railway project settings
2. Review Railway logs for specific errors
3. Verify `package.json` start script is correct: `"start": "node src/server.js"`
4. Ensure all dependencies are in `package.json`

---

## 📝 Environment Files Reference

This repository contains the following environment configuration files:

### Frontend (Client)
- `/client/.env.local` - Local development (localhost)
- `/client/.env.production` - Production template (Railway URL) ⚠️ **Reference only, not deployed**
- `/client/.env.local.example` - Example template

### Backend (Server)
- `/server/.env` - Local development (localhost)
- `/server/.env.production` - Production template (Vercel URL) ⚠️ **Reference only, not deployed**
- `/server/.env.example` - Example template

> **Important**: The `.env.production` files are **templates** for your reference. Actual environment variables must be set directly on Vercel and Railway platforms. These files are NOT automatically loaded by the deployment platforms.

---

## 🔒 Security Best Practices

1. ✅ **Never commit** `.env` or `.env.production` files with real secrets to Git
2. ✅ **Use strong JWT secrets** (32+ characters, random)
3. ✅ **Enable MongoDB Atlas IP whitelist** (even if set to 0.0.0.0/0, consider restricting later)
4. ✅ **Rotate secrets regularly** (JWT secrets, database passwords)
5. ✅ **Use environment variables** on platforms, never hardcode secrets
6. ✅ **Enable HTTPS** for both frontend and backend (handled by Vercel and Railway)
7. ✅ **Review CORS settings** - only allow your frontend domain

---

## 📞 Need Help?

If you encounter issues not covered here:

1. **Check Railway Logs**: Railway Dashboard → Service → Logs tab
2. **Check Vercel Logs**: Vercel Dashboard → Deployment → View Build Logs
3. **Browser Console**: F12 → Console tab for frontend errors
4. **Network Tab**: F12 → Network tab to inspect API requests
5. **Review ENV-TEMPLATE.md** in the repository root for additional deployment guidance

---

## ✅ Deployment Checklist

Use this checklist to ensure everything is configured correctly:

### Before Deploying:
- [ ] MongoDB Atlas cluster created and configured
- [ ] Database user created with strong password
- [ ] Network access set to 0.0.0.0/0 (or specific IPs)
- [ ] Connection string tested locally

### Vercel Configuration:
- [ ] Project deployed from GitHub
- [ ] Root directory set to `client`
- [ ] `NEXT_PUBLIC_API_URL` environment variable added
- [ ] Production environment selected
- [ ] Deployment successful (check build logs)

### Railway Configuration:
- [ ] Project deployed from GitHub
- [ ] Root directory set to `server`
- [ ] All environment variables added (copy from `/server/.env.production`)
- [ ] `MONGODB_URI` updated with real connection string
- [ ] JWT secrets copied from local `.env`
- [ ] Deployment successful (check logs)

### Google OAuth:
- [ ] Google Cloud Console project created
- [ ] OAuth 2.0 Client ID created
- [ ] Production redirect URI added: `https://nexboard-server-production-6f0b.up.railway.app/api/auth/google/callback`
- [ ] Client ID and Secret updated on Railway
- [ ] Changes saved (wait 5-10 minutes for propagation)

### Verification:
- [ ] Backend health endpoint returns `{"status":"ok","database":"connected"}`
- [ ] Frontend loads without errors
- [ ] No CORS errors in browser console
- [ ] Sign up flow works (email/password)
- [ ] Login flow works (email/password)
- [ ] Google OAuth login works
- [ ] Can create projects
- [ ] Can create and manage tasks

---

**🎉 Deployment Complete!**

Your NexBoard application should now be fully configured and running in production.

