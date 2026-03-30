# Quick Deployment Steps for College Project

## 🎯 Goal
Deploy NexBoard to the cloud for your college project demonstration.

## 📋 What You'll Deploy To

| Component | Platform | Cost |
|-----------|----------|------|
| Frontend (Next.js) | Vercel | FREE |
| Backend (Express) | Railway | FREE ($5 credit/month) |
| Database (MongoDB) | MongoDB Atlas | FREE (512MB) |

---

## ⚡ Quick Start (30 minutes)

### 1️⃣ MongoDB Atlas (10 min)
```
→ mongodb.com/cloud/atlas
→ Create free cluster
→ Create database user
→ Get connection string
→ Save it for later
```

### 2️⃣ Railway - Backend (10 min)
```
→ railway.app
→ New Project → Deploy from GitHub
→ Select NexBoard repo
→ Add environment variables (see DEPLOYMENT.md)
→ Root Directory: /server
→ Copy the generated URL
```

### 3️⃣ Vercel - Frontend (10 min)
```
→ vercel.com
→ Import NexBoard from GitHub
→ Root Directory: client
→ Add env var: NEXT_PUBLIC_API_URL=<Railway-URL>/api
→ Deploy
→ Get your live URL!
```

### 4️⃣ Update CORS
```
→ Back to Railway
→ Update CORS_ORIGIN to your Vercel URL
→ Redeploy
```

---

## ✅ Before You Start

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Sign up for accounts** (use GitHub login for all):
   - https://vercel.com
   - https://railway.app
   - https://mongodb.com/cloud/atlas

---

## 🔑 Environment Variables Quick Reference

### Railway (Backend)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nexboard
JWT_SECRET=change-this-to-random-string-abc123xyz
REFRESH_TOKEN_SECRET=another-random-string-xyz789abc
CORS_ORIGIN=https://your-app.vercel.app
NODE_ENV=production
PORT=5000
```

### Vercel (Frontend)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

---

## 📝 For Your Submission

After deployment, note these down:

- **Live URL**: https://your-app.vercel.app
- **Backend API**: https://your-backend.railway.app
- **GitHub Repo**: https://github.com/your-username/NexBoard

---

## 🆘 Having Issues?

Check the detailed [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

**Most common issues:**
1. **CORS errors** → Check CORS_ORIGIN matches Vercel URL exactly
2. **Database errors** → Check MongoDB connection string password
3. **Build fails** → Check Root Directory is set correctly

---

## 🧪 Test Your Deployment

✅ Backend health: `https://your-backend.railway.app/api/health`
✅ Frontend: Open Vercel URL and try signup
✅ Features: Create project, add tasks, test drag-and-drop

---

**Total time**: ~30 minutes
**Total cost**: $0 (100% free tier)

Good luck! 🚀
