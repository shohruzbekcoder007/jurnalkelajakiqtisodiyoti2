import { Link } from 'react-router-dom';
import PostThumb from './PostThumb.jsx';
import Html from './Html.jsx';
import { formatDate, machineDate } from '../utils/format.js';

export function PostMeta({ post }) {
  return (
    <div className="post-meta group">
      {post.categories?.length > 0 && (
        <p className="post-category">
          {post.categories.map((c, i) => (
            <span key={c._id || c.slug}>
              {i > 0 && ' / '}
              <Link to={`/category/${c.slug}`} rel="category tag">
                {c.name}
              </Link>
            </span>
          ))}
        </p>
      )}
      <p className="post-date">
        <time className="published updated" dateTime={machineDate(post.date)}>
          {formatDate(post.date)}
        </time>
      </p>
    </div>
  );
}

// The `.post-standard.grid-item` card used by the main post list
export default function PostCard({ post }) {
  return (
    <article className="group post-standard grid-item excerpt post type-post status-publish format-standard hentry">
      <div className="post-inner post-hover">
        <PostThumb post={post} />

        <div className="post-content">
          <PostMeta post={post} />

          <h2 className="post-title entry-title">
            <Link to={`/${post.slug}`} rel="bookmark">
              <Html html={post.title} />
            </Link>
          </h2>

          <div className="entry excerpt entry-summary">
            <p>{post.excerpt}</p>
          </div>
        </div>
      </div>
    </article>
  );
}
