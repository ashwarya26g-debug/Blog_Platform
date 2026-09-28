# DevEcho · User-Specific Blog Platform

A modern, full-stack blog platform built with **React 18 + Vite**, **Node.js + Express**, and **PostgreSQL via Sequelize ORM**. Anyone can browse and read published posts without an account, while authenticated users can write, manage, and draft articles, like posts, and join conversations through comment threads.

---

## 🚀 Key Features

- **Public Access**: Anyone can browse the feed, search articles by title, and read full stories anonymously.
- **JWT Authentication**: Secure user registration and login with bcrypt-hashed passwords (10 salt rounds) and stateless JSON Web Tokens.
- **Post Authoring & Drafts**: Create, update, and delete your own articles. Posts can be published immediately or saved privately as drafts (`published: false`), visible only to their author.
- **Interactive Social Features**:
  - **Likes Toggle**: Authenticated users can like and unlike posts with real-time counter updates. Enforced by a composite database uniqueness constraint (`postId`, `userId`).
  - **Comment Threads**: Authenticated users can comment on any published article.
  - **Author Comment Management**: Authors can delete their own comments directly.
- **Server-Side Authorization**: Complete ownership validation enforced at the controller level (`403 Forbidden` on unauthorized edits or deletions).
- **Automated Integration Tests**: Built-in test suite covering 17 end-to-end authentication and CRUD invariants in under a second.
- **Production UI**: Polished glassmorphic design system with modern typography (`Plus Jakarta Sans` & `Inter`), micro-interactions, responsive mobile layout, and quick demo login buttons.

---

## 🛠️ Tech Stack

| Layer | Technology | Key Highlights |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Axios | Glassmorphic design system, responsive grid, optimistic state |
| **Backend** | Node.js, Express | Modular controllers, routes, centralized error handling |
| **Database** | PostgreSQL 16, Sequelize ORM | Relational models, cascade deletions, composite unique indexes |
| **Auth** | JWT (`jsonwebtoken`), `bcryptjs` | Stateless Bearer token authentication, auth middlewares |
| **Testing** | Node.js native test runner + Supertest | 17 automated integration tests with zero config |
| **DevOps** | Docker Compose | One-command isolated PostgreSQL container |

---

## 📂 Project Structure

```
blog-platform/
├── client/                     # React 18 SPA (Vite)
│   ├── src/
│   │   ├── api/                # Axios instance with auto-attaching JWT interceptor
│   │   ├── context/            # AuthContext (login, register, logout, session restoration)
│   │   ├── components/         # Navbar, PostCard, LikeButton, CommentList, ProtectedRoute
│   │   ├── pages/              # Home, PostDetail, CreatePost, EditPost, MyPosts, Login, Register
│   │   └── index.css           # Modern design system (tokens, glassmorphism, responsive)
│   └── vite.config.js          # Vite configuration with /api proxy to backend
├── server/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # Sequelize database connection setup
│   │   ├── models/             # Sequelize models (User, Post, Comment, Like) with associations
│   │   ├── middleware/         # requireAuth and attachUserIfPresent middlewares
│   │   ├── controllers/        # Request handlers with server-side authorization checks
│   │   ├── routes/             # Express route mappings
│   │   ├── scripts/            # syncDb.js and seed.js (pre-populated demo content)
│   │   ├── app.js              # Express app definition (exported for testing)
│   │   └── server.js           # Server bootstrapper & database connection
│   └── test/
│       └── api.test.js         # 17 automated integration tests
├── docs/                       # Project Documentation
│   ├── ARCHITECTURE.md         # Architecture diagrams, ERD, sequence diagrams, tradeoffs
│   ├── API.md                  # Comprehensive API contracts & endpoints
│   └── USAGE.md                # Submission guide & 2-Minute Loom demo script
└── docker-compose.yml          # Local PostgreSQL container specification
```

---

## ⚡ Quick Start

### 1. Start PostgreSQL
Using Docker Compose:
```bash
docker compose up -d
```
*Or use an existing local PostgreSQL instance (database name: `blog_platform`).*

### 2. Start the Backend API
```bash
cd server
cp .env.example .env
npm install
npm run seed          # Creates demo users (Alice & Bob), sample articles, drafts, comments & likes
npm run dev           # Starts API server on http://localhost:5000
```
Health check: `GET http://localhost:5000/health` → `{"status":"ok"}`

### 3. Start the Frontend Application
In a new terminal:
```bash
cd client
cp .env.example .env
npm install
npm run dev           # Starts Vite dev server on http://localhost:5173
```
Open **`http://localhost:5173`** in your browser.

---

## 👥 Demo Credentials

The `npm run seed` command automatically prepares two testing accounts (also available via one-click buttons on the Login page):

- **Alice (Author)**: `alice@example.com` / `password123`
- **Bob (Reader/Author)**: `bob@example.com` / `password123`

---

## 🧪 Running Automated Tests

Run the full integration test suite covering auth, drafts privacy, like toggling, and authorization enforcement:

```bash
cd server
npm run test
```

---

## 📖 Documentation Index

- **[System Architecture (`docs/ARCHITECTURE.md`)](docs/ARCHITECTURE.md)**: Architectural tiers, Mermaid ERD, sequence diagrams, and design decisions.
- **[API Contracts (`docs/API.md`)](docs/API.md)**: Exhaustive request and response shapes, error schemas, and authorization rules.
- **[Submission & Usage Guide (`docs/USAGE.md`)](docs/USAGE.md)**: User guide, verification steps, and a **2-Minute Loom Video Script** with exact timecodes.

---

## 📝 Production Readiness & Trade-offs

1. **Database Migrations**: Currently uses `sequelize.sync({ alter: true })` for rapid developer onboarding. In production, this would be managed via versioned Umzug/Sequelize-CLI migrations.
2. **Token Security**: Tokens are handled via Bearer headers for seamless client-side consumption. In high-security environments, `httpOnly` secure cookies with short expiration + rotating refresh tokens in Redis are recommended.
3. **Rate Limiting**: Auth endpoints should be protected with `express-rate-limit` to defend against credential stuffing.
