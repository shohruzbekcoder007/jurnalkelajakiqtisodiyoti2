import { Link } from 'react-router-dom';

// The original theme draws this inline SVG whenever a post has no featured
// image — which is every post on the source site.
const PLACEHOLDER_PATH =
  'M928 832q0-14-9-23t-23-9q-66 0-113 47t-47 113q0 14 9 23t23 9 23-9 9-23q0-40 28-68t68-28q14 0 23-9t9-23zm224 130q0 106-75 181t-181 75-181-75-75-181 75-181 181-75 181 75 75 181zm-1024 574h1536v-128h-1536v128zm1152-574q0-159-112.5-271.5t-271.5-112.5-271.5 112.5-112.5 271.5 112.5 271.5 271.5 112.5 271.5-112.5 112.5-271.5zm-1024-642h384v-128h-384v128zm-128 192h1536v-256h-828l-64 128h-644v128zm1664-256v1280q0 53-37.5 90.5t-90.5 37.5h-1536q-53 0-90.5-37.5t-37.5-90.5v-1280q0-53 37.5-90.5t90.5-37.5h1536q53 0 90.5 37.5t37.5 90.5z';

export default function PostThumb({ post, className = '', showComments = true }) {
  return (
    <div className={`post-thumbnail ${className}`.trim()}>
      <Link to={`/${post.slug}`}>
        {post.thumbnail ? (
          <img src={post.thumbnail} alt={post.title} />
        ) : (
          <>
            {/* The SVG is the theme's hover overlay (opacity 0 at rest); the
                520x245 PNG underneath is what actually draws the grey block. */}
            <svg
              className="hu-svg-placeholder thumb-medium-empty"
              viewBox="0 0 1792 1792"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path d={PLACEHOLDER_PATH} />
            </svg>
            <img
              className="hu-img-placeholder"
              src="/img/thumb-medium-empty.png"
              alt={post.title}
            />
          </>
        )}
      </Link>
      {showComments && (
        <Link className="post-comments" to={`/${post.slug}#respond`}>
          <i className="far fa-comments" />
          {post.commentCount || 0}
        </Link>
      )}
    </div>
  );
}
