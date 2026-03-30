# Environment Variables Template

## Copy these to your deployment platforms

---

## 🚂 RAILWAY (Backend)

Go to: Railway Project → Variables → Raw Editor → Paste this:

```env
NODE_ENV=production
PORT=5000

# MongoDB Atlas - Get this from MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://nexboard_user:YOUR_PASSWORD_HERE@nexboard-cluster.xxxxx.mongodb.net/nexboard?retryWrites=true&w=majority

# JWT Secrets - CHANGE THESE to random strings!
JWT_SECRET=your_super_secret_jwt_key_change_this_abc123xyz789
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your_refresh_token_secret_change_this_xyz789abc123
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS - Update after Vercel deployment
CORS_ORIGIN=https://nexboard.vercel.app

# Email (Optional - can skip for demo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

**⚠️ IMPORTANT**:
1. Replace `MONGODB_URI` with your actual MongoDB Atlas connection string
2. Replace `JWT_SECRET` and `REFRESH_TOKEN_SECRET` with random strings
3. Update `CORS_ORIGIN` after you get your Vercel URL

---

## ▲ VERCEL (Frontend)

Go to: Vercel Project → Settings → Environment Variables → Add:

**Variable Name**: `NEXT_PUBLIC_API_URL`
**Value**: `https://your-backend-name.up.railway.app/api`

Replace `your-backend-name.up.railway.app` with your actual Railway URL.

---

## 🍃 MONGODB ATLAS

### Connection String Format:
```
mongodb+srv://<username>:<password>@<cluster-name>.xxxxx.mongodb.net/<database>?retryWrites=true&w=majority
```

### Example:
```
mongodb+srv://nexboard_user:MyPassword123@nexboard-cluster.ab1cd.mongodb.net/nexboard?retryWrites=true&w=majority
```

**To get yours**:
1. MongoDB Atlas → Database → Connect
2. Connect your application
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Add `/nexboard` before the `?` to specify database name

---

## 🔐 Generating Secure Secrets

Use one of these methods to generate JWT secrets:

### Method 1: Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Method 2: Online
Visit: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")

### Method 3: Simple Random String
Just mash your keyboard for a long random string (at least 32 characters):
```
asdf89h23n4kj5h6lkj234h5lkjh234kljh2345kjhwer
```

---

## 📋 Deployment Checklist

### Before Deploying:

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password saved
- [ ] Network access set to 0.0.0.0/0
- [ ] Connection string copied

### Railway Deployment:

- [ ] Railway account created
- [ ] Repo pushed to GitHub
- [ ] Project created from GitHub
- [ ] Root directory set to `/server`
- [ ] All environment variables added
- [ ] Backend URL copied

### Vercel Deployment:

- [ ] Vercel account created
- [ ] Root directory set to `client`
- [ ] NEXT_PUBLIC_API_URL added
- [ ] Deployment successful
- [ ] Frontend URL copied

### Final Steps:

- [ ] Update CORS_ORIGIN on Railway with Vercel URL
- [ ] Test backend health endpoint
- [ ] Test frontend signup/login
- [ ] Test creating projects and tasks

---

## 🧪 Testing URLs

After deployment, test these:

1. **Backend Health**: 
   ```
   https://your-backend.up.railway.app/api/health
   ```
   Should return: `{"status":"ok","database":"connected"}`

2. **Frontend**: 
   ```
   https://your-app.vercel.app
   ```
   Should load the login page

3. **Full Flow**:
   - Sign up with email
   - Create a project
   - Add a task
   - Test drag and drop

---

## 🆘 Quick Troubleshooting

### "CORS policy" error
→ Check CORS_ORIGIN matches your Vercel URL exactly (with https://)

### "Network Error" or API calls failing
→ Check NEXT_PUBLIC_API_URL is correct
→ Test backend health endpoint

### "MongoServerError" or database connection failed
→ Check MongoDB connection string
→ Verify IP whitelist is 0.0.0.0/0
→ Check database user password is correct

### Build failed on Vercel
→ Check Root Directory is set to `client`
→ Check build logs for specific error

---

Good luck! 🚀
