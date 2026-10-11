import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Html from './Html.jsx';
import PostThumb from './PostThumb.jsx';
import { PostMeta } from './PostCard.jsx';

/**
 * Reimplementation of the FlexSlider the original theme mounts on
 * #flexslider-featured — same markup and class names, transform-based track.
 */
export default function FeaturedSlider({ posts }) {
  const [index, setIndex] = useState(0);
  const count = posts.length;

  useEffect(() => {
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  if (!count) return null;

  const go = (i) => setIndex(((i % count) + count) % count);

  return (
    <div className="featured flexslider" id="flexslider-featured">
      <div className="hu-slider-viewport flex-viewport">
        <ul
          className="slides hu-slider-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {posts.map((post) => (
            <li key={post._id}>
              <article className="group post type-post status-publish format-standard hentry">
                <div className="post-inner post-hover">
                  <PostThumb post={post} className="featured-img-thumb-large" />

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
              </article>
            </li>
          ))}
        </ul>
      </div>

      <ol className="flex-control-nav flex-control-paging">
        {posts.map((post, i) => (
          <li key={post._id}>
            <a
              className={i === index ? 'flex-active' : ''}
              onClick={(e) => {
                e.preventDefault();
                go(i);
              }}
              href="#"
            >
              {i + 1}
            </a>
          </li>
        ))}
      </ol>

      <ul className="flex-direction-nav">
        <li className="flex-nav-prev">
          <a
            className="flex-prev"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go(index - 1);
            }}
          >
            Previous
          </a>
        </li>
        <li className="flex-nav-next">
          <a
            className="flex-next"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              go(index + 1);
            }}
          >
            Next
          </a>
        </li>
      </ul>
    </div>
  );
}
