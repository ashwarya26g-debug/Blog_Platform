const { test, describe, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const { sequelize } = require('../src/models');

describe('Blog Platform API Test Suite', () => {
  let user1Token;
  let user1Id;
  let user2Token;
  let user2Id;
  let testPostId;
  let testPostSlug;
  let draftPostId;
  let commentId;

  before(async () => {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
  });

  after(async () => {
    await sequelize.close();
  });

  test('GET /health returns status ok', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'ok');
  });

  test('POST /api/auth/register creates user and returns JWT token', async () => {
    const email = `testuser_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Author', email, password: 'password123' });

    assert.equal(res.status, 201);
    assert.ok(res.body.token);
    assert.equal(res.body.user.name, 'Test Author');
    assert.equal(res.body.user.email, email);

    user1Token = res.body.token;
    user1Id = res.body.user.id;
  });

  test('POST /api/auth/register rejects duplicate email with 409', async () => {
    const email = `testdup_${Date.now()}@example.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'First', email, password: 'password123' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Second', email, password: 'password123' });

    assert.equal(res.status, 409);
    assert.ok(res.body.error);
  });

  test('POST /api/auth/login logs in user successfully', async () => {
    const email = `testlogin_${Date.now()}@example.com`;
    await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test Reader', email, password: 'password123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'password123' });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, email);

    user2Token = res.body.token;
    user2Id = res.body.user.id;
  });

  test('GET /api/posts allows unauthenticated browsing of published posts', async () => {
    const res = await request(app).get('/api/posts');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.pagination);
  });

  test('POST /api/posts creates a published post when authenticated', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: `Automated Test Post ${Date.now()}`,
        excerpt: 'An excerpt for automated testing',
        content: 'Full content of the automated test post.',
        published: true,
      });

    assert.equal(res.status, 201);
    assert.ok(res.body.data.id);
    assert.ok(res.body.data.slug);
    assert.equal(res.body.data.authorId, user1Id);

    testPostId = res.body.data.id;
    testPostSlug = res.body.data.slug;
  });

  test('POST /api/posts creates a private draft when published: false', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        title: `Private Draft ${Date.now()}`,
        content: 'This draft should not be publicly accessible.',
        published: false,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.published, false);
    draftPostId = res.body.data.id;
  });

  test('Draft post is hidden from public GET /posts feed', async () => {
    const res = await request(app).get('/api/posts');
    const found = res.body.data.find((p) => p.id === draftPostId);
    assert.equal(found, undefined);
  });

  test('PUT /api/posts/:id updates post for author', async () => {
    const res = await request(app)
      .put(`/api/posts/${testPostId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'Updated Post Title' });

    assert.equal(res.status, 200);
    assert.equal(res.body.data.title, 'Updated Post Title');
  });

  test('PUT /api/posts/:id rejects non-author edit with 403 Forbidden', async () => {
    const res = await request(app)
      .put(`/api/posts/${testPostId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ title: 'Unauthorized Edit Attempt' });

    assert.equal(res.status, 403);
  });

  test('POST /api/posts/:postId/likes allows authenticated user to like and unlike (toggle)', async () => {
    // Like
    const likeRes = await request(app)
      .post(`/api/posts/${testPostId}/likes`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.equal(likeRes.status, 200);
    assert.equal(likeRes.body.data.liked, true);
    assert.equal(likeRes.body.data.likeCount, 1);

    // Unlike
    const unlikeRes = await request(app)
      .post(`/api/posts/${testPostId}/likes`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.equal(unlikeRes.status, 200);
    assert.equal(unlikeRes.body.data.liked, false);
    assert.equal(unlikeRes.body.data.likeCount, 0);
  });

  test('POST /api/posts/:postId/likes rejects unauthenticated request with 401', async () => {
    const res = await request(app).post(`/api/posts/${testPostId}/likes`);
    assert.equal(res.status, 401);
  });

  test('POST /api/posts/:postId/comments allows authenticated user to comment', async () => {
    const res = await request(app)
      .post(`/api/posts/${testPostId}/comments`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ body: 'Great test article!' });

    assert.equal(res.status, 201);
    assert.equal(res.body.data.body, 'Great test article!');
    assert.ok(res.body.data.author);
    assert.equal(res.body.data.author.id, user2Id);

    commentId = res.body.data.id;
  });

  test('DELETE /api/comments/:id rejects deletion by non-author with 403', async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 403);
  });

  test('DELETE /api/comments/:id allows deletion by comment author', async () => {
    const res = await request(app)
      .delete(`/api/comments/${commentId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.equal(res.status, 204);
  });

  test('DELETE /api/posts/:id rejects deletion by non-author with 403', async () => {
    const res = await request(app)
      .delete(`/api/posts/${testPostId}`)
      .set('Authorization', `Bearer ${user2Token}`);

    assert.equal(res.status, 403);
  });

  test('DELETE /api/posts/:id allows deletion by post author', async () => {
    const res = await request(app)
      .delete(`/api/posts/${testPostId}`)
      .set('Authorization', `Bearer ${user1Token}`);

    assert.equal(res.status, 204);
  });
});
