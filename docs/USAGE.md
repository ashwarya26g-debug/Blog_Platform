# User Guide & Submission Verification

This document provides a complete guide for running, testing, and reviewing the **DevEcho / Blog Platform**, along with a pre-formatted **2-Minute Video Demo Script** for assignment evaluation.

---

## 1. Quick Setup & Execution

### Prerequisites
- Node.js 18+ (tested on Node v20/v26)
- PostgreSQL 14+ or Docker

### Step 1: Database Setup
You can either use the included Docker Compose configuration:
```bash
docker compose up -d
```
Or use a local PostgreSQL instance (default credentials in `.env.example`):
```bash
# Database name: blog_platform
createdb blog_platform
```

### Step 2: Backend Setup
```bash
cd server
cp .env.example .env    # Pre-configured with local defaults
npm install
npm run seed            # Seeds sample users (Alice & Bob), posts, comments, likes
npm run dev             # Starts server on http://localhost:5000
```

### Step 3: Frontend Setup
In a second terminal:
```bash
cd client
cp .env.example .env    # Points to http://localhost:5000/api
npm install
npm run dev             # Starts Vite on http://localhost:5173
```

---

## 2. Pre-seeded Demo Accounts

The database comes pre-seeded with two accounts for instant testing:

| Role | Email | Password | Pre-seeded Content |
| :--- | :--- | :--- | :--- |
| **Author (Alice)** | `alice@example.com` | `password123` | 2 published articles, 1 private draft, comments & likes |
| **Reader / Contributor (Bob)** | `bob@example.com` | `password123` | 1 published article, comments & likes |

---

## 3. Core Feature Walkthrough Checklist

| Feature | How to Verify | Expected Behavior |
| :--- | :--- | :--- |
| **Public Browsing** | Open `http://localhost:5173` without logging in. | All published posts appear. Search filter operates dynamically. Private drafts are hidden. |
| **Unauthenticated Protection** | Click "Like", "Comment", or navigate to `/new`. | Promptly redirects to `/login`. No unauthenticated writes reach the database. |
| **User Authentication** | Log in with Alice or Bob (or use the one-click demo login buttons). | JWT is stored in client, and top navbar displays personalized avatar pill and greeting. |
| **Publishing New Posts** | Click "+ New Post", fill in Title, Excerpt, Content, and leave "Publish" checked. | Post is generated with a unique slug and immediately visible in the public feed. |
| **Draft Creation & Privacy** | Create another post with "Publish immediately" unchecked. | Post is saved as a Draft. Appears in Alice's "My Posts" dashboard with a "Draft" badge, but is invisible to the public feed or to Bob. |
| **Liking Posts (Toggle)** | Click the heart icon on any post. | Counter increments and turns red. Clicking again unlikes and decrements the counter. |
| **Commenting** | Add a comment under any post. | New comment is appended to the discussion with author avatar and timestamp. |
| **Comment Ownership Deletion** | Log in as the comment's author. | Delete button appears exclusively on the author's own comments. Clicking removes it from the list. |
| **Post Management** | Visit "My Posts" (`/my-posts`). | Shows author statistics (Total, Published, Drafts), edit links, and deletion triggers. |
| **Server-Side Authorization** | Attempt to edit or delete another user's post via API. | Server returns `403 Forbidden` (`You can only edit your own posts`). |

---

## 4. Running the Automated Test Suite

An automated integration test suite is included in `server/test/api.test.js`, testing all authentication flows, draft privacy, and CRUD permissions:

```bash
cd server
npm run test
```

Expected Output:
```
▶ Blog Platform API Test Suite
  ✔ GET /health returns status ok
  ✔ POST /api/auth/register creates user and returns JWT token
  ✔ POST /api/auth/register rejects duplicate email with 409
  ✔ POST /api/auth/login logs in user successfully
  ✔ GET /api/posts allows unauthenticated browsing of published posts
  ✔ POST /api/posts creates a published post when authenticated
  ✔ POST /api/posts creates a private draft when published: false
  ✔ Draft post is hidden from public GET /posts feed
  ✔ PUT /api/posts/:id updates post for author
  ✔ PUT /api/posts/:id rejects non-author edit with 403 Forbidden
  ✔ POST /api/posts/:postId/likes allows authenticated user to like and unlike (toggle)
  ✔ POST /api/posts/:postId/likes rejects unauthenticated request with 401
  ✔ POST /api/posts/:postId/comments allows authenticated user to comment
  ✔ DELETE /api/comments/:id rejects deletion by non-author with 403
  ✔ DELETE /api/comments/:id allows deletion by comment author
  ✔ DELETE /api/posts/:id rejects deletion by non-author with 403
  ✔ DELETE /api/posts/:id allows deletion by post author
✔ Blog Platform API Test Suite (17 tests, 0 failures)
```

---

## 5. 2-Minute Video / Loom Demo Script

Below is the structured, timed script for presenting the video walkthrough:

### **[0:00 - 0:25] Introduction & Public Browsing**
- **Action**: Show `http://localhost:5173` on browser.
- **Narrative**:
  > *"Hi everyone! This is the walkthrough for our User-Specific Blog Platform built with a React SPA frontend, Express REST API, PostgreSQL database via Sequelize, and JWT authentication. Right now, I'm completely unauthenticated. Notice that anyone can browse recent published articles, read detailed content, and use the real-time search filter. However, notice that private drafts are completely hidden from public view."*

### **[0:25 - 0:50] Authentication & Protected Creation**
- **Action**: Click "Log In", use the demo login button for Alice, show navbar changes, then click "+ New Post".
- **Narrative**:
  > *"When an unauthenticated reader tries to write or like, they are prompted to sign in. I'll click our quick demo button to log in as Alice. The JWT session is authenticated, and Alice's dashboard reveals her publication count. Let's create a new article. We can write our title, an excerpt, rich content, and publish it immediately. When we submit, it automatically generates a slug and appears on the feed."*

### **[0:50 - 1:15] Drafts Management & Privacy**
- **Action**: Create a second post, uncheck "Publish immediately", click save. Navigate to "My Posts".
- **Narrative**:
  > *"Authors can also save private drafts. If I uncheck 'Publish immediately', this draft is stored safely in PostgreSQL. In Alice's 'My Posts' dashboard, we can see the amber Draft badge. If we open an incognito window or log out, this draft does not exist in the public feed—privacy is strictly enforced both in the UI and server queries."*

### **[1:15 - 1:40] Social Interactions: Likes & Comments**
- **Action**: Log in as Bob in an incognito window or switch users. Open Alice's post, click Like, write a comment, then delete Bob's own comment.
- **Narrative**:
  > *"Now let's switch to Bob. Bob reads Alice's post. When Bob clicks the heart, our like toggle fires: it creates a row in the join table and increments the counter with a heart animation. Bob can also leave a comment. Notice that Bob has a 'Delete' button on his own comment, but cannot delete Alice's comments. Database constraints guarantee that Bob can only like a post once."*

### **[1:40 - 2:00] Architecture, Tests & Conclusion**
- **Action**: Switch to terminal, run `npm run test` in `server`, showing 17 passing tests.
- **Narrative**:
  > *"Behind the scenes, all ownership checks happen server-side—preventing unauthorized edits with 403 Forbidden responses. Our automated test suite covers all 17 critical authentication and CRUD invariants in under a second. The project is fully modular, docker-ready, and documented with comprehensive API contracts. Thank you for watching!"*
