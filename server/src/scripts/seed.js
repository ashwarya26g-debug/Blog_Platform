require('dotenv').config();
const { sequelize, User, Post, Comment, Like } = require('../models');

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');
    await sequelize.sync({ alter: true });

    // Clear existing data in reverse dependency order
    await Like.destroy({ where: {} });
    await Comment.destroy({ where: {} });
    await Post.destroy({ where: {} });
    await User.destroy({ where: {} });

    console.log('Previous records cleared.');

    // Create Demo Users
    const alice = await User.create({
      name: 'Alice Vance',
      email: 'alice@example.com',
      passwordHash: 'password123',
    });

    const bob = await User.create({
      name: 'Bob Martin',
      email: 'bob@example.com',
      passwordHash: 'password123',
    });

    console.log('Demo users created (alice@example.com, bob@example.com)');

    // Create Posts for Alice
    const post1 = await Post.create({
      title: 'Architecting Scalable Microservices with Node.js and PostgreSQL',
      slug: 'architecting-scalable-microservices-with-nodejs-and-postgresql',
      excerpt: 'Key strategies for designing resilient, decoupled backend services with connection pooling, stateless authentication, and predictable database indexing.',
      content: `When building modern backend architectures, scalability and maintainability must go hand in hand. 

### Why Stateless Services Win
By decoupling authentication and state from individual server processes using JSON Web Tokens (JWT) and external relational stores like PostgreSQL, backend instances can scale horizontally behind load balancers with zero sticky session requirements.

### Database Indexing & Query Planning
PostgreSQL handles millions of records gracefully when composite indexes and foreign key constraints are meticulously chosen. In this platform, composite uniqueness constraints ensure that likes and user-specific references maintain complete data integrity at the database layer.

### Practical Key Takeaways:
1. Always enforce database-level uniqueness alongside application logic.
2. Utilize connection pools to prevent thread exhaustion under high concurrent load.
3. Keep tokens lightweight with clear cryptographic signatures (e.g. HS256/RS256).`,
      published: true,
      authorId: alice.id,
    });

    const post2 = await Post.create({
      title: 'Modern CSS in 2026: Container Queries, Subgrid, and Glassmorphism',
      slug: 'modern-css-in-2026-container-queries-subgrid-and-glassmorphism',
      excerpt: 'Explore how native CSS modern capabilities allow us to build stunning, responsive user interfaces without heavy external dependencies.',
      content: `CSS has evolved dramatically. Today, responsive design is no longer limited to viewport media queries; container queries allow components to adjust dynamically based on their parent context.

Combined with backdrop-filter glassmorphism, subtle CSS custom properties, and fluid typography, frontend developers can achieve state-of-the-art aesthetics while maintaining lean asset footprints.

Try resizing your browser window or inspecting the post card components to see fluid responsive behavior in action!`,
      published: true,
      authorId: alice.id,
    });

    const draft1 = await Post.create({
      title: 'Upcoming Trends in AI-Driven Developer Workflows (Draft)',
      slug: 'upcoming-trends-in-ai-driven-developer-workflows-draft',
      excerpt: 'Notes and early research on agentic coding frameworks and automated regression verification.',
      content: 'This draft is private and only visible to the author (Alice Vance). Once finalized, it will be published to the public feed.',
      published: false,
      authorId: alice.id,
    });

    // Create Posts for Bob
    const post3 = await Post.create({
      title: 'Clean Code Principles for Full-Stack JavaScript Teams',
      slug: 'clean-code-principles-for-full-stack-javascript-teams',
      excerpt: 'A practical guide to structuring controllers, service boundaries, and frontend custom hooks for long-term project longevity.',
      content: `Clean architecture is not about dogmatic adherence to rules; it is about reducing cognitive overhead for your future self and your teammates.

- **Single Responsibility**: Each route handler handles validation and delegations; models handle schema rules and associations.
- **Fail Fast**: Check authorization and input constraints at the edge of your controllers.
- **Zero Surprises**: Keep naming consistent and predictable across both client and server contracts.`,
      published: true,
      authorId: bob.id,
    });

    console.log('Sample posts created.');

    // Add Likes
    await Like.create({ postId: post1.id, userId: bob.id });
    await Like.create({ postId: post2.id, userId: bob.id });
    await Like.create({ postId: post3.id, userId: alice.id });

    // Add Comments
    await Comment.create({
      body: 'Incredible breakdown on PostgreSQL constraints, Alice! The composite index on Likes is spot on.',
      postId: post1.id,
      authorId: bob.id,
    });

    await Comment.create({
      body: 'Thanks Bob! Relational integrity at the DB level prevents race conditions cleanly.',
      postId: post1.id,
      authorId: alice.id,
    });

    await Comment.create({
      body: 'Love the point on single responsibility. Separation of controllers from models keeps unit testing effortless.',
      postId: post3.id,
      authorId: alice.id,
    });

    console.log('Sample likes and comments created.');
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

seed();
