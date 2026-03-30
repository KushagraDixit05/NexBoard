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

# Check if MongoDB is already running (via Docker or local)
if lsof -i :27017 >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} MongoDB already running on port 27017"
else
    echo -e "${RED}✗${NC} MongoDB not running on port 27017"
    echo -e "${BLUE}→${NC} Please start MongoDB with Docker Compose:"
    echo -e "   ${BLUE}docker-compose up -d${NC}"
    exit 1
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
echo "  • MongoDB:  mongodb://localhost:27017 (Docker)"
echo "  • Backend:  http://localhost:5000"
echo "  • Frontend: http://localhost:3000 (start separately)"
echo ""
echo "Quick Links:"
echo "  • Health:   http://localhost:5000/api/health"
echo "  • Auth:     http://localhost:3000/auth"
echo ""
echo "Logs:"
echo "  • MongoDB:  Check 'docker logs nexboard-mongo'"
echo "  • Backend:  /tmp/nexboard-server.log"
echo ""
echo "To manage Docker containers:"
echo "  • Start:    docker-compose up -d"
echo "  • Stop:     docker-compose down"
echo "  • Logs:     docker-compose logs -f"
echo ""
