import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import LikeButton from '../components/LikeButton';
import CommentList from '../components/CommentList';

export default function PostDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/posts/${slug}`)
      .then((res) => setPost(res.data.data))
      .catch((err) => {
        setError(err.response?.data?.error || 'Post not found or you do not have permission.');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleDelete() {
    if (!window.confirm('Are you sure you want to delete this post? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/posts/${post.id}`);
      navigate('/my-posts');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete post.');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="page narrow">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="page narrow">
        <div className="alert-error">
          <span>⚠️ {error || 'Post not found.'}</span>
        </div>
        <Link to="/" className="back-link">
          ← Back to all posts
        </Link>
      </div>
    );
  }

  const isOwner = user && user.id === post.author?.id;
  const authorInitial = (post.author?.name || 'U')[0].toUpperCase();
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <article className="page post-detail-page">
      <Link to="/" className="back-link">
        ← Back to all articles
      </Link>

      <header className="article-header">
        {!post.published && (
          <span className="badge badge-warning">Draft (Only visible to you)</span>
        )}
        <h1 className="article-title">{post.title}</h1>

        <div className="article-author-bar">
          <div className="author-avatar">{authorInitial}</div>
          <div className="author-details">
            <span className="author-name">{post.author?.name || 'Unknown Author'}</span>
            <span className="article-date">Published {formattedDate}</span>
          </div>
        </div>
      </header>

      <div className="article-body">
        {post.content.split('\n\n').map((paragraph, index) => {
          if (paragraph.startsWith('### ')) {
            return <h3 key={index}>{paragraph.replace('### ', '')}</h3>;
          }
          if (paragraph.startsWith('## ')) {
            return <h2 key={index}>{paragraph.replace('## ', '')}</h2>;
          }
          return <p key={index}>{paragraph}</p>;
        })}
      </div>

      <div className="article-actions-bar">
        <div className="engagement-left">
          <LikeButton postId={post.id} initialLiked={post.likedByMe} initialCount={post.likeCount} />
        </div>

        {isOwner && (
          <div className="author-controls">
            <Link to={`/edit/${post.id}`} className="btn btn-sm btn-outline">
              ✏️ Edit Post
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-sm btn-danger"
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : '🗑️ Delete Post'}
            </button>
          </div>
        )}
      </div>

      <hr className="divider" />

      <CommentList postId={post.id} initialComments={post.comments} />
    </article>
  );
}
