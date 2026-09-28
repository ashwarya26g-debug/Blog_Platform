import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

export default function MyPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api
      .get('/me/posts')
      .then((res) => {
        setPosts(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this post permanently? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/posts/${id}`);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post.');
    } finally {
      setDeletingId(null);
    }
  }

  const publishedCount = posts.filter((p) => p.published).length;
  const draftCount = posts.filter((p) => !p.published).length;

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="dashboard-header">
        <div>
          <h1>My Publications</h1>
          <p className="page-subtitle">
            Manage your published stories and in-progress drafts.
          </p>
        </div>
        <Link to="/new" className="btn btn-primary">
          + Write New Post
        </Link>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{posts.length}</span>
          <span className="stat-label">Total Posts</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{publishedCount}</span>
          <span className="stat-label">Published</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{draftCount}</span>
          <span className="stat-label">Drafts</span>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✍️</div>
          <h3>You haven't written any posts yet</h3>
          <p>Share your engineering insights or stories with the world.</p>
          <Link to="/new" className="btn btn-primary">
            Create your first post
          </Link>
        </div>
      ) : (
        <div className="my-posts-grid">
          {posts.map((post) => (
            <div key={post.id} className="my-post-card">
              <div className="my-post-main">
                <div className="my-post-status">
                  {post.published ? (
                    <span className="badge badge-success">Published</span>
                  ) : (
                    <span className="badge badge-warning">Draft</span>
                  )}
                  <span className="my-post-date">
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <h3 className="my-post-title">
                  <Link to={`/posts/${post.slug}`}>{post.title}</Link>
                </h3>
                <p className="my-post-excerpt">{post.excerpt || post.content.slice(0, 140) + '...'}</p>
              </div>

              <div className="my-post-actions">
                <Link to={`/posts/${post.slug}`} className="btn btn-sm btn-ghost">
                  View
                </Link>
                <Link to={`/edit/${post.id}`} className="btn btn-sm btn-outline">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
                  className="btn btn-sm btn-danger-outline"
                >
                  {deletingId === post.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
