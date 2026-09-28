import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function CommentList({ postId, initialComments }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState(initialComments || []);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, { body: text });
      setComments((prev) => [...prev, res.data.data]);
      setText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!window.confirm('Delete this comment?')) return;
    setDeletingId(commentId);
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment:', err);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="comments">
      <div className="section-header">
        <h3>Comments <span className="counter-pill">{comments.length}</span></h3>
      </div>

      {comments.length === 0 ? (
        <p className="no-comments-msg">No comments yet. Be the first to share your thoughts!</p>
      ) : (
        <ul className="comment-list">
          {comments.map((c) => {
            const isCommentAuthor = user && (user.id === c.author?.id || user.id === c.authorId);
            const authorInitial = (c.author?.name || 'U')[0].toUpperCase();
            return (
              <li key={c.id} className="comment-item">
                <div className="comment-avatar">{authorInitial}</div>
                <div className="comment-body-wrapper">
                  <div className="comment-header">
                    <span className="comment-author">{c.author?.name || 'Anonymous'}</span>
                    {c.createdAt && (
                      <span className="comment-date">
                        {new Date(c.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                    {isCommentAuthor && (
                      <button
                        type="button"
                        className="btn-text-danger"
                        onClick={() => handleDeleteComment(c.id)}
                        disabled={deletingId === c.id}
                        title="Delete comment"
                      >
                        {deletingId === c.id ? 'Deleting...' : 'Delete'}
                      </button>
                    )}
                  </div>
                  <p className="comment-text">{c.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={user ? 'Write a thoughtful comment...' : 'Log in to leave a comment'}
          disabled={!user || submitting}
        />
        <div className="comment-form-actions">
          <button type="submit" className="btn btn-primary" disabled={submitting || !user || !text.trim()}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>
    </section>
  );
}
