# Taskboard - Realtime Kanban MVP

A production-ready MERN stack realtime kanban board application with authentication, organizations, RBAC, and drag-and-drop functionality.

## Tech Stack

- **Backend**: Node.js 20, Express, MongoDB, Mongoose, Socket.IO, Redis
- **Frontend**: React 19, Vite, TailwindCSS, DaisyUI, React Query
- **Auth**: JWT (access + refresh tokens), bcrypt
- **Realtime**: Socket.IO with Redis adapter (prepared for Iteration 2)

## Features

- Email/password authentication with JWT tokens
- Organization and team management with RBAC (owner/admin/member)
- Board, list, and card CRUD operations
- Drag-and-drop with optimistic updates
- Card features: labels, due dates, checklists, assignments
- Activity logging
- Notifications system
- Docker support for local development

## Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm or yarn

## Quick Start with Docker

1. Clone the repository
2. Copy environment files:
   ```bash
   cp packages/api/.env.example packages/api/.env
   cp packages/web/.env.example packages/web/.env
   ```

3. Start all services:
   ```bash
   docker-compose up
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - API: http://localhost:3000

## Local Development (without Docker)

### Backend Setup

1. Navigate to the API directory:
   ```bash
   cd packages/api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy and configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start MongoDB and Redis (via Docker or local installation)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Seed demo data (optional):
   ```bash
   npm run seed
   ```

### Frontend Setup

1. Navigate to the web directory:
   ```bash
   cd packages/web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy and configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your API URL
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Testing

### Backend Tests
```bash
cd packages/api
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## Project Structure

```
taskboard/
├── packages/
│   ├── api/           # Express backend
│   │   ├── src/
│   │   │   ├── config/      # Configuration files
│   │   │   ├── models/      # Mongoose models
│   │   │   ├── routes/      # API routes
│   │   │   ├── controllers/ # Route controllers
│   │   │   ├── middleware/  # Express middleware
│   │   │   ├── services/    # Business logic
│   │   │   ├── sockets/     # Socket.IO handlers
│   │   │   └── utils/       # Utilities
│   │   ├── tests/           # API tests
│   │   └── Dockerfile
│   │
│   └── web/           # React frontend
│       ├── src/
│       │   ├── api/         # API client
│       │   ├── components/  # React components
│       │   ├── pages/       # Page components
│       │   ├── hooks/       # Custom hooks
│       │   ├── contexts/    # React contexts
│       │   └── utils/       # Utilities
│       └── Dockerfile
│
├── docker-compose.yml
└── .github/workflows/  # CI/CD
```

## Data Model

- **User**: Email, password, name
- **Org**: Organization with owner
- **Membership**: User-Org relationships with roles
- **Board**: Kanban board within an org
- **List**: Column in a board
- **Card**: Task card with labels, checklists, due dates
- **Label**: Color-coded labels for cards
- **Activity**: Audit log for board actions
- **Notification**: User notifications

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `GET /api/orgs` - List user organizations
- `POST /api/orgs` - Create organization
- `GET /api/boards` - List boards in org
- `POST /api/boards` - Create board
- `GET /api/boards/:id` - Get board details
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `GET /api/boards/:id/activity` - Get board activity
- `POST /api/lists` - Create list
- `PUT /api/lists/:id` - Update list
- `DELETE /api/lists/:id` - Delete list
- `POST /api/lists/:id/reorder` - Reorder list
- `POST /api/cards` - Create card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card
- `POST /api/cards/:id/move` - Move/reorder card
- `GET /api/labels` - List labels for board
- `POST /api/labels` - Create label
- `PUT /api/labels/:id` - Update label
- `DELETE /api/labels/:id` - Delete label
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read

## License

MIT
