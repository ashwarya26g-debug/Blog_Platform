import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [published, setPublished] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.post('/posts', { title, excerpt, content, published });
      navigate(`/posts/${res.data.data.slug}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create post.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page narrow form-page">
      <div className="form-card">
        <Link to="/my-posts" className="back-link">
          ← Back to My Posts
        </Link>
        <div className="form-header">
          <h1>Create New Article</h1>
          <p className="page-subtitle">Publish an article or save it as a draft for later.</p>
        </div>

        <form onSubmit={handleSubmit} className="styled-form">
          <div className="form-group">
            <label htmlFor="title">Article Title</label>
            <input
              id="title"
              placeholder="e.g. Scaling WebSockets with Redis and Node.js"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="excerpt">
              Short Excerpt <span className="label-hint">(optional summary for cards)</span>
            </label>
            <input
              id="excerpt"
              placeholder="A brief summary of what readers will learn..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Article Content (Markdown supported)</label>
            <textarea
              id="content"
              rows={12}
              placeholder="Write your story here... You can use ## Subheadings and paragraphs."
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
                <strong>Publish publicly immediately</strong>
                <span className="toggle-desc">
                  {published ? 'Anyone will be able to read this post.' : 'Saved privately as a draft in your dashboard.'}
                </span>
              </span>
            </label>
          </div>

          {error && (
            <div className="alert-error">
              <span>⚠️ {error}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
              {busy ? 'Saving...' : published ? 'Publish Story' : 'Save as Draft'}
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
