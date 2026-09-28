# API Contracts

Base URL (local): `http://localhost:5000/api`

All request/response bodies are JSON. Authenticated endpoints require:

```
Authorization: Bearer <jwt>
```

Error responses always take the shape `{ "error": "message" }`.

---

## Auth

### `POST /auth/register`
Create an account and receive a token immediately (no separate login
step needed after signup).

**Body**
```json
{ "name": "Alice", "email": "alice@example.com", "password": "password123" }
```
`password` must be at least 8 characters.

**201 Created**
```json
{
  "token": "eyJhbGciOi...",
  "user": { "id": "uuid", "name": "Alice", "email": "alice@example.com" }
}
```

**Errors**: `400` missing/invalid fields · `409` email already registered

---

### `POST /auth/login`
**Body**
```json
{ "email": "alice@example.com", "password": "password123" }
```
**200 OK** — same shape as register.
**Errors**: `400` missing fields · `401` invalid credentials

---

### `GET /auth/me` 🔒
Returns the current authenticated user (useful on app load to restore
session from a stored token).

**200 OK**
```json
{ "user": { "id": "uuid", "name": "Alice", "email": "alice@example.com" } }
```

---

## Posts

### `GET /posts`
Public. Lists **published** posts only, newest first, with pagination
and optional title search.

**Query params**: `page` (default 1), `limit` (default 10, max 50),
`search` (optional, case-insensitive title match)

**200 OK**
```json
{
  "data": [
    {
      "id": "uuid", "title": "Hello World", "slug": "hello-world",
      "excerpt": "...", "published": true, "createdAt": "...",
      "author": { "id": "uuid", "name": "Alice" },
      "likeCount": "3", "commentCount": "1"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

---

### `GET /posts/:slug`
Public (optionally authenticated — send a token to get `likedByMe`).
Returns full post content, author, comments, and like info. Unpublished
posts return `404` unless requested by their own author.

**200 OK**
```json
{
  "data": {
    "id": "uuid", "title": "Hello World", "slug": "hello-world",
    "content": "...", "published": true,
    "author": { "id": "uuid", "name": "Alice" },
    "comments": [
      { "id": "uuid", "body": "Nice post!", "author": { "id": "uuid", "name": "Bob" }, "createdAt": "..." }
    ],
    "likeCount": 3,
    "likedByMe": true
  }
}
```
**Errors**: `404` not found / not yours to see as a draft

---

### `GET /me/posts` 🔒
Returns **all** of the current user's posts, including unpublished
drafts.

**200 OK** — `{ "data": [ ...posts ] }`

---

### `POST /posts` 🔒
Create a post. `slug` is derived from `title` automatically (with a
numeric suffix if it collides). Defaults to `published: true`.

**Body**
```json
{ "title": "Hello World", "content": "My first post.", "excerpt": "optional", "published": true }
```
**201 Created** — `{ "data": { ...post } }`
**Errors**: `400` missing title/content

---

### `PUT /posts/:id` 🔒
Update a post you own. All fields optional — only sent fields are
updated.

**Body** (any subset)
```json
{ "title": "New title", "content": "...", "excerpt": "...", "published": false }
```
**200 OK** — `{ "data": { ...updated post } }`
**Errors**: `403` not the author · `404` not found

---

### `DELETE /posts/:id` 🔒
Delete a post you own (cascades to its comments and likes).

**204 No Content**
**Errors**: `403` not the author · `404` not found

---

## Comments

### `POST /posts/:postId/comments` 🔒
**Body**: `{ "body": "Nice post!" }`
**201 Created** — `{ "data": { id, body, createdAt, author: { id, name } } }`
**Errors**: `400` empty body · `404` post not found/not published

### `DELETE /comments/:id` 🔒
Delete a comment you authored.
**204 No Content**
**Errors**: `403` not the author · `404` not found

---

## Likes

### `POST /posts/:postId/likes` 🔒
Toggles the current user's like on a post (like if not liked, unlike if
already liked). Idempotent in the sense that calling it twice returns
you to the original state.

**200 OK**
```json
{ "data": { "liked": true, "likeCount": 4 } }
```
**Errors**: `404` post not found/not published

---

## Misc

### `GET /health`
Unauthenticated liveness check — `{ "status": "ok" }`.
