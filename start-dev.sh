#!/bin/bash

# NexBoard Development Startup Script
# This script starts MongoDB and the backend server

set -e

echo "🚀 Starting NexBoard Development Environment..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MongoDB is already running
if lsof -i :27017 >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MongoDB already running on port 27017"
else
    echo -e "${BLUE}→${NC} Starting MongoDB..."
    mkdir -p /tmp/nexboard-mongodb
    mongod --dbpath /tmp/nexboard-mongodb --port 27017 --bind_ip 127.0.0.1 --logpath /tmp/mongodb.log --fork >/dev/null 2>&1
    sleep 2
    
    if lsof -i :27017 >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} MongoDB started on port 27017"
    else
        echo -e "${RED}✗${NC} Failed to start MongoDB"
        exit 1
    fi
fi

# Check if backend is already running
if lsof -i :5000 >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend already running on port 5000"
else
    echo -e "${BLUE}→${NC} Starting backend server..."
    cd server
    npm run dev > /tmp/nexboard-server.log 2>&1 &
    cd ..
    sleep 3
    
    if lsof -i :5000 >/dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} Backend started on port 5000"
    else
        echo -e "${RED}✗${NC} Failed to start backend server"
        echo "Check logs at: /tmp/nexboard-server.log"
        exit 1
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}✅ NexBoard Development Environment Ready!${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "Services:"
echo "  • MongoDB:  http://localhost:27017"
echo "  • Backend:  http://localhost:5000"
echo "  • Frontend: http://localhost:3000 (start separately)"
echo ""
echo "Quick Links:"
echo "  • Health:   http://localhost:5000/api/health"
echo "  • Auth:     http://localhost:3000/auth"
echo ""
echo "Logs:"
echo "  • MongoDB:  /tmp/mongodb.log"
echo "  • Backend:  /tmp/nexboard-server.log"
echo ""
echo "To stop services:"
echo "  • MongoDB:  kill \$(lsof -ti :27017)"
echo "  • Backend:  kill \$(lsof -ti :5000)"
echo ""
