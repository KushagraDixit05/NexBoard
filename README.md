# NexBoard

A modern Kanban project management platform — rebuilt from Kanboard using **Next.js 14**, **Express.js**, and **MongoDB**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Drag & Drop | @hello-pangea/dnd |
| Charts | Recharts |
| Backend | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + bcrypt |
| Validation | Zod |
| File Upload | Multer |
| Email | Nodemailer |
| Scheduling | node-cron |

## Project Structure

```
nexboard/
├── client/          # Next.js 14 frontend
├── server/          # Express.js backend
├── Documentation/   # Phase docs, SRS, diagrams
├── docker-compose.yml
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7 (or Docker)

### Development Setup

```bash
# Clone & install
git clone <repo>
cd nexboard
npm install

# Start with Docker (recommended)
docker-compose up -d

# OR start manually
# Terminal 1 — backend
cd server && cp .env.example .env && npm run dev

# Terminal 2 — frontend
cd client && cp .env.local.example .env.local && npm run dev
```

The backend runs on http://localhost:5000  
The frontend runs on http://localhost:3000

## API Health Check

```
GET http://localhost:5000/api/health
```

## Environment Variables

See `server/.env.example` and `client/.env.local.example`.

## Documentation

- [Phase 1 — Reverse Engineering & Architecture](./Documentation/phase1-reverse-engineering.md)
- [Phase 2 — Backend Development](./Documentation/phase2-backend-development.md)
