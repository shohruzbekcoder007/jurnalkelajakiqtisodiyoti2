import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCategory, fetchPosts } from '../api/client.js';
import PostCard from '../components/PostCard.jsx';
import Pagination from '../components/Pagination.jsx';
import { POSTS_PER_PAGE, SITE_TITLE } from '../config.js';
import { MONTHS } from '../utils/format.js';
import { NotFoundBody } from './NotFound.jsx';

// `.page-title` on an archive is an <h1> with a Font Awesome glyph, the
// archive kind, then the term inside a <span> — as the theme emits it.
function ArchiveShell({ label, icon, term, loading, posts, page, totalPages, basePath }) {
  return (
    <main className="content" id="content">
      <div className="page-title hu-pad group">
        <h1>
          <i className={`fas ${icon}`} />
          {label} <span>{term} </span>
        </h1>
      </div>

      <div className="hu-pad group">
        {loading ? (
          <p className="hu-loading">Yuklanmoqda...</p>
        ) : posts.length === 0 ? (
          <p className="hu-loading">Maqolalar topilmadi.</p>
        ) : (
          <div id="grid-wrapper" className="post-list-standard">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} basePath={basePath} />
      </div>
    </main>
  );
}

export function CategoryArchive() {
  const { slug, pageNum } = useParams();
  const page = Math.max(1, parseInt(pageNum, 10) || 1);
  const [category, setCategory] = useState(null);
  const [data, setData] = useState({ posts: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      fetchCategory(slug).catch(() => ({ category: null })),
      fetchPosts({ category: slug, page, per_page: POSTS_PER_PAGE })
    ])
      .then(([c, p]) => {
        if (!alive) return;
        setCategory(c.category);
        setData(p);
        document.title = `${c.category?.name || slug} | ${SITE_TITLE}`;
      })
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug, page]);

  return (
    <ArchiveShell
      label="Category:"
      icon="fa-folder-open"
      term={category?.name || slug}
      loading={loading}
      posts={data.posts}
      page={page}
      totalPages={data.totalPages}
      basePath={`/category/${slug}`}
    />
  );
}

export function DateArchive() {
  const { year, month, day, pageNum } = useParams();
  const page = Math.max(1, parseInt(pageNum, 10) || 1);
  const [data, setData] = useState({ posts: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);

  // This route shape also catches non-date two-segment paths; only real
  // /YYYY/MM[/DD] permalinks belong here.
  const isDatePath =
    /^\d{4}$/.test(year || '') && /^\d{1,2}$/.test(month || '') && (!day || /^\d{1,2}$/.test(day));

  const label = day
    ? `${MONTHS[parseInt(month, 10) - 1]} ${parseInt(day, 10)}, ${year}`
    : month
    ? `${MONTHS[parseInt(month, 10) - 1]} ${year}`
    : year;

  useEffect(() => {
    if (!isDatePath) {
      setLoading(false);
      return undefined;
    }
    let alive = true;
    setLoading(true);
    fetchPosts({ year, month, day, page, per_page: POSTS_PER_PAGE })
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));
    document.title = `${label} | ${SITE_TITLE}`;
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, day, page, isDatePath]);

  if (!isDatePath) return <NotFoundBody />;

  const basePath = day ? `/${year}/${month}/${day}` : month ? `/${year}/${month}` : `/${year}`;

  return (
    <ArchiveShell
      label={day ? 'Daily Archive:' : 'Monthly Archive:'}
      icon="fa-calendar"
      term={label}
      loading={loading}
      posts={data.posts}
      page={page}
      totalPages={data.totalPages}
      basePath={basePath}
    />
  );
}

export function AuthorArchive() {
  const { name, pageNum } = useParams();
  const page = Math.max(1, parseInt(pageNum, 10) || 1);
  const [data, setData] = useState({ posts: [], totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchPosts({ author: name, page, per_page: POSTS_PER_PAGE })
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));
    document.title = `${name} | ${SITE_TITLE}`;
    return () => {
      alive = false;
    };
  }, [name, page]);

  return (
    <ArchiveShell
      label="Author:"
      icon="fa-user"
      term={name}
      loading={loading}
      posts={data.posts}
      page={page}
      totalPages={data.totalPages}
      basePath={`/author/${name}`}
    />
  );
}

export default ArchiveShell;
