import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get('/me/posts')
      .then((res) => {
        const post = res.data.data.find((p) => p.id === id);
        if (!post) {
          setError('Post not found or you do not have permission to edit it.');
        } else {
          setTitle(post.title);
          setExcerpt(post.excerpt || '');
          setContent(post.content);
          setPublished(post.published);
          setSlug(post.slug);
        }
      })
      .catch(() => {
        setError('Failed to fetch post details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.put(`/posts/${id}`, { title, excerpt, content, published });
      navigate(published ? `/posts/${slug}` : '/my-posts');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not update post.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="page narrow form-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page narrow form-page">
      <div className="form-card">
        <Link to="/my-posts" className="back-link">
          ← Back to My Posts
        </Link>
        <div className="form-header">
          <h1>Edit Article</h1>
          <p className="page-subtitle">Update your published post or change its visibility.</p>
        </div>

        {error && (
          <div className="alert-error">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="styled-form">
          <div className="form-group">
            <label htmlFor="title">Article Title</label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">Short Excerpt</label>
            <input
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Article Content</label>
            <textarea
              id="content"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>

          <div className="toggle-box">
            <label className="checkbox-custom-label">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <span className="toggle-text">
                <strong>Published publicly</strong>
                <span className="toggle-desc">
                  {published
                    ? 'This post is live and readable by everyone.'
                    : 'Uncheck to unpublish and keep as a private draft.'}
                </span>
              </span>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
              {busy ? 'Saving...' : 'Save Changes'}
            </button>
            <Link to="/my-posts" className="btn btn-outline btn-lg">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
