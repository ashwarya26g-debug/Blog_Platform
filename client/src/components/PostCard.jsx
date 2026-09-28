import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  const authorInitial = (post.author?.name || 'U')[0].toUpperCase();
  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <article className="post-card">
      <div className="post-card-header">
        <div className="author-badge">
          <div className="author-avatar">{authorInitial}</div>
          <div className="author-info">
            <span className="author-name">{post.author?.name || 'Unknown Author'}</span>
            <span className="post-date">{formattedDate}</span>
          </div>
        </div>
      </div>

      <h2 className="post-card-title">
        <Link to={`/posts/${post.slug}`}>{post.title}</Link>
      </h2>

      <p className="post-card-excerpt">{post.excerpt}</p>

      <div className="post-card-footer">
        <div className="post-metrics">
          <span className="metric-pill" title="Likes">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
            {post.likeCount ?? 0}
          </span>
          <span className="metric-pill" title="Comments">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
            </svg>
            {post.commentCount ?? 0}
          </span>
        </div>

        <Link to={`/posts/${post.slug}`} className="read-more-link">
          Read post <span>→</span>
        </Link>
      </div>
    </article>
  );
}
