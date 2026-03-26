# NexBoard - MongoDB Setup Guide

This guide will help you set up MongoDB for the NexBoard project. You can choose between two approaches:
- **Option 1**: Docker-based setup (Recommended - simpler and isolated)
- **Option 2**: Standalone MongoDB with Compass (Manual installation)

---

## Prerequisites

✅ **Already installed:**
- Docker Desktop
- MongoDB Compass

✅ **Need to install:**
- Node.js 18+ ([Download](https://nodejs.org/))

---

## Option 1: Docker-based Setup (Recommended)

This approach uses Docker to run MongoDB in a container, keeping your system clean and making it easy to start/stop.

### Step 1: Verify Docker Desktop is Running

1. Open **Docker Desktop** application
2. Wait until Docker is fully started (you'll see a green indicator)
3. Verify Docker is running:
   ```bash
   docker --version
   docker ps
   ```

### Step 2: Start MongoDB with Docker Compose

The project already includes a `docker-compose.yml` file configured for MongoDB.

```bash
# Navigate to project root
cd /media/kushagra/crucial/NexBoard

# Start only MongoDB (not the entire stack)
docker-compose up -d mongodb
```

This will:
- Download MongoDB 7 image (if not already downloaded)
- Create a container named `nexboard-mongo`
- Expose MongoDB on port `27017`
- Create a persistent volume `mongo-data` for your database files

### Step 3: Verify MongoDB is Running

```bash
# Check if container is running
docker ps

# You should see:
# CONTAINER ID   IMAGE       COMMAND                  PORTS
# xxxxxxxxxx     mongo:7     "docker-entrypoint.s…"   0.0.0.0:27017->27017/tcp
```

### Step 4: Connect with MongoDB Compass

1. Open **MongoDB Compass**
2. In the connection string field, enter:
   ```
   mongodb://localhost:27017
   ```
3. Click **Connect**
4. You should see a `nexboard` database (it will be created automatically when the server first connects)

### Step 5: Set Up Server Environment Variables

```bash
# Navigate to server directory
cd server

# Create .env file from example
cp .env.example .env

# The default MongoDB URI is already correct:
# MONGODB_URI=mongodb://localhost:27017/nexboard
```

### Step 6: Install Dependencies and Start Development

```bash
# Install dependencies (from project root)
cd /media/kushagra/crucial/NexBoard
npm install

# Start the development server
npm run dev
```

### Managing Docker MongoDB

```bash
# Stop MongoDB
docker-compose stop mongodb

# Start MongoDB
docker-compose start mongodb

# Stop and remove container (data persists in volume)
docker-compose down

# View MongoDB logs
docker logs nexboard-mongo

# Access MongoDB shell
docker exec -it nexboard-mongo mongosh

# Remove everything including data (⚠️ destroys all data)
docker-compose down -v
```

---

## Option 2: Standalone MongoDB Installation

If you prefer not to use Docker, you can install MongoDB directly on your system.

### Step 1: Install MongoDB Community Server

#### On Ubuntu/Debian:

```bash
# Import MongoDB public key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Verify it's running
sudo systemctl status mongod
```

#### On Other Linux Distros:

Visit: https://www.mongodb.com/docs/manual/administration/install-on-linux/

### Step 2: Verify MongoDB is Running

```bash
# Check if MongoDB is listening on port 27017
sudo netstat -tlnp | grep 27017

# Or try connecting with mongosh
mongosh
```

### Step 3: Connect with MongoDB Compass

1. Open **MongoDB Compass**
2. Connection string: `mongodb://localhost:27017`
3. Click **Connect**

### Step 4: Set Up Server Environment

```bash
# Navigate to server directory
cd /media/kushagra/crucial/NexBoard/server

# Create .env file
cp .env.example .env

# The MongoDB URI should be:
# MONGODB_URI=mongodb://localhost:27017/nexboard
```

### Step 5: Start Development

```bash
# From project root
cd /media/kushagra/crucial/NexBoard
npm install
npm run dev
```

### Managing Standalone MongoDB

```bash
# Start MongoDB
sudo systemctl start mongod

# Stop MongoDB
sudo systemctl stop mongod

# Restart MongoDB
sudo systemctl restart mongod

# Check status
sudo systemctl status mongod

# View logs
sudo journalctl -u mongod -f
```

---

## Verifying the Setup

### 1. Check Backend Connection

```bash
# Start the server
cd /media/kushagra/crucial/NexBoard
npm run dev:server
```

You should see in the logs:
```
✅ Connected to MongoDB successfully
Server running on port 5000
```

### 2. Test API Health Check

Open your browser or use curl:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

### 3. View Database in Compass

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. You should see the `nexboard` database
4. Explore collections as they're created (users, projects, tasks, etc.)

---

## Environment Variables Reference

Edit `server/.env` with these settings:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/nexboard

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-this
REFRESH_TOKEN_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# Email (optional - configure later)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

⚠️ **Important**: Change the JWT secrets to strong random strings in production!

---

## Troubleshooting

### MongoDB Connection Refused

**Problem**: `MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017`

**Solutions**:
- Docker: Check if container is running with `docker ps`
- Standalone: Check if MongoDB service is running with `sudo systemctl status mongod`
- Check if port 27017 is in use by another process: `sudo lsof -i :27017`

### Port 27017 Already in Use

```bash
# Find what's using port 27017
sudo lsof -i :27017

# If it's an old MongoDB instance, stop it
sudo systemctl stop mongod

# Or if it's a Docker container
docker stop nexboard-mongo
```

### Can't Connect with Compass

1. Verify MongoDB is running
2. Try connecting with `mongosh` first to rule out Compass issues
3. Check firewall settings
4. Use connection string: `mongodb://localhost:27017` (without database name)

### Database Not Created

The `nexboard` database will be created automatically when:
1. The Express server starts and connects to MongoDB
2. The first document is inserted into any collection

Don't worry if you don't see it immediately in Compass.

### Permission Denied (Standalone MongoDB)

```bash
# Fix MongoDB data directory permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
sudo systemctl restart mongod
```

---

## Recommended Approach

**For Development**: Use **Option 1 (Docker)** because:
- ✅ Clean and isolated environment
- ✅ Easy to start/stop
- ✅ Matches production setup
- ✅ No system-wide installation
- ✅ Easy to reset/clean data
- ✅ Consistent across team members

**For Production**: Use a managed MongoDB service like:
- MongoDB Atlas (free tier available)
- AWS DocumentDB
- DigitalOcean Managed MongoDB

---

## Next Steps

1. ✅ Set up MongoDB (choose Option 1 or 2)
2. ✅ Create `server/.env` file
3. ✅ Install dependencies: `npm install`
4. ✅ Start development: `npm run dev`
5. ✅ Open http://localhost:3000 in your browser
6. 📖 Read the [Documentation](./Documentation/) for more details

---

## Quick Reference Commands

### Docker MongoDB
```bash
docker-compose up -d mongodb     # Start
docker-compose stop mongodb      # Stop
docker logs nexboard-mongo       # View logs
docker exec -it nexboard-mongo mongosh  # Access shell
```

### Standalone MongoDB
```bash
sudo systemctl start mongod      # Start
sudo systemctl stop mongod       # Stop
sudo systemctl status mongod     # Check status
mongosh                          # Access shell
```

### Development
```bash
npm run dev                      # Start both client and server
npm run dev:server               # Start server only
npm run dev:client               # Start client only
```

---

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [Docker Documentation](https://docs.docker.com/)
- [MongoDB Compass Guide](https://docs.mongodb.com/compass/)

---

**Need help?** Check the logs:
- Server logs: Terminal output where you ran `npm run dev`
- MongoDB Docker logs: `docker logs nexboard-mongo`
- MongoDB standalone logs: `sudo journalctl -u mongod -f`
