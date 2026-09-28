import { useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function LikeButton({ postId, initialLiked, initialCount }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (!user) {
      navigate('/login');
      return;
    }
    setBusy(true);
    try {
      const res = await api.post(`/posts/${postId}/likes`);
      setLiked(res.data.data.liked);
      setCount(res.data.data.likeCount);
    } catch (err) {
      console.error('Failed to toggle like:', err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      className={`like-btn ${liked ? 'liked' : ''}`}
      onClick={handleClick}
      disabled={busy}
      title={liked ? 'Unlike this post' : 'Like this post'}
    >
      <svg
        className={`heart-icon ${liked ? 'heart-filled' : 'heart-outline'}`}
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={liked ? '#ef4444' : 'none'}
        stroke={liked ? '#ef4444' : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className="like-count">{count}</span>
      <span className="like-label">{liked ? 'Liked' : 'Like'}</span>
    </button>
  );
}
