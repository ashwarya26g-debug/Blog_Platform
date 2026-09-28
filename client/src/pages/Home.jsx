import { useEffect, useState } from 'react';
import api from '../api/axios';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    api
      .get('/posts', { params: { search } })
      .then((res) => {
        if (!ignore) setPosts(res.data.data);
      })
      .catch(() => {
        if (!ignore) setError('Could not load posts. Please try again.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [search]);

  return (
    <div className="page home-page">
      <section className="hero-section">
        <div className="hero-badge">✨ Community Publications</div>
        <h1 className="hero-title">Thoughts, code & perspectives.</h1>
        <p className="hero-subtitle">
          Read freely without logging in, or sign in to publish your own articles, like insights, and join the conversation.
        </p>

        <div className="search-wrapper">
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="search-box"
            placeholder="Search articles by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear-btn" onClick={() => setSearch('')} title="Clear search">
              ✕
            </button>
          )}
        </div>
      </section>

      <div className="feed-header">
        <h2 className="feed-title">
          {search ? `Search results for "${search}"` : 'Recent Publications'}
        </h2>
        {!loading && <span className="feed-count">{posts.length} {posts.length === 1 ? 'article' : 'articles'}</span>}
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading articles...</p>
        </div>
      )}

      {error && (
        <div className="alert-error">
          <span>⚠️ {error}</span>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <h3>No articles found</h3>
          <p>
            {search ? 'Try adjusting your search keywords.' : 'Be the first author to publish a story!'}
          </p>
          {search && (
            <button className="btn btn-outline" onClick={() => setSearch('')}>
              Clear Search
            </button>
          )}
        </div>
      )}

      {!loading && (
        <div className="post-list">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
