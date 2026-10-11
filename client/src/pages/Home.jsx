import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { fetchFeatured, fetchPosts, resolveLegacy } from '../api/client.js';
import FeaturedSlider from '../components/FeaturedSlider.jsx';
import PostCard from '../components/PostCard.jsx';
import Pagination from '../components/Pagination.jsx';
import { FEATURED_COUNT, POSTS_PER_PAGE, SITE_TITLE } from '../config.js';

export default function Home() {
  const { pageNum } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get('s') || '';
  const page = Math.max(1, parseInt(pageNum, 10) || 1);

  // Imported content still links with WordPress's ?p= / ?cat= query permalinks
  const legacyP = searchParams.get('p');
  const legacyCat = searchParams.get('cat');
  const legacyPageId = searchParams.get('page_id');

  useEffect(() => {
    if (!legacyP && !legacyCat && !legacyPageId) return;
    resolveLegacy({ p: legacyP, cat: legacyCat, page_id: legacyPageId })
      .then((d) => d?.path && navigate(d.path, { replace: true }))
      .catch(() => {});
  }, [legacyP, legacyCat, legacyPageId, navigate]);

  const [featured, setFeatured] = useState([]);
  const [data, setData] = useState({ posts: [], totalPages: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  // The slider only shows on the unfiltered first page, like the original
  const showSlider = page === 1 && !search;

  useEffect(() => {
    if (!showSlider) {
      setFeatured([]);
      return undefined;
    }
    let alive = true;
    fetchFeatured(FEATURED_COUNT)
      .then((d) => alive && setFeatured(d.posts || []))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [showSlider]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchPosts({ page, per_page: POSTS_PER_PAGE, search: search || undefined })
      .then((d) => alive && setData(d))
      .catch(() => alive && setData({ posts: [], totalPages: 0, total: 0 }))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [page, search]);

  useEffect(() => {
    document.title = search
      ? `Qidiruv natijalari: ${search} | ${SITE_TITLE}`
      : `${SITE_TITLE} | ${page > 1 ? `Sahifa ${page}` : 'Bosh sahifa'}`;
  }, [search, page]);

  return (
    <main className="content" id="content">
      <div className="page-title hu-pad group">
        {search ? (
          <h1>
            <i className="fas fa-search" /> {data.total} Search results
          </h1>
        ) : (
          <h2>
            {SITE_TITLE} <span className="hu-blog-subheading">Blog</span>
          </h2>
        )}
      </div>

      <div className="hu-pad group">
        {showSlider && featured.length > 0 && <FeaturedSlider posts={featured} />}

        {loading ? (
          <p className="hu-loading">Yuklanmoqda...</p>
        ) : data.posts.length === 0 ? (
          <p className="hu-loading">
            {search ? 'Soʻrovingiz boʻyicha hech narsa topilmadi.' : 'Maqolalar topilmadi.'}
          </p>
        ) : (
          <div id="grid-wrapper" className="post-list-standard">
            {data.posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {!search && <Pagination page={page} totalPages={data.totalPages} />}
      </div>
    </main>
  );
}
