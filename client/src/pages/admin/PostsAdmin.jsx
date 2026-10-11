import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminPosts, deletePost } from '../../api/client.js';
import { formatDate } from '../../utils/format.js';

export default function PostsAdmin() {
  const [data, setData] = useState({ posts: [], total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [term, setTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminPosts({ page, per_page: 20, search: search || undefined })
      .then(setData)
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(load, [load]);

  const remove = async (post) => {
    if (!window.confirm(`"${post.title}" maqolasi oʻchirilsinmi?`)) return;
    await deletePost(post._id);
    load();
  };

  return (
    <>
      <h1>
        Maqolalar <span style={{ fontSize: 14, color: '#777' }}>({data.total})</span>{' '}
        <Link className="hu-btn" to="/admin/posts/new" style={{ fontSize: 13, marginLeft: 8 }}>
          + Yangi
        </Link>
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setSearch(term.trim());
        }}
        style={{ display: 'flex', gap: 8, marginBottom: 14, maxWidth: 460 }}
      >
        <input
          type="text"
          placeholder="Sarlavha boʻyicha qidirish..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button className="hu-btn" type="submit">
          Qidirish
        </button>
      </form>

      {loading ? (
        <p className="hu-loading">Yuklanmoqda...</p>
      ) : (
        <>
          <table className="hu-admin-table">
            <thead>
              <tr>
                <th>Sarlavha</th>
                <th style={{ width: 180 }}>Rukn</th>
                <th style={{ width: 130 }}>Sana</th>
                <th style={{ width: 90 }}>Holat</th>
                <th style={{ width: 170 }}>Amallar</th>
              </tr>
            </thead>
            <tbody>
              {data.posts.map((p) => (
                <tr key={p._id}>
                  <td>
                    <Link to={`/admin/posts/${p._id}`}>{p.title}</Link>
                  </td>
                  <td>{(p.categories || []).map((c) => c.name).join(', ')}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>{p.status === 'publish' ? 'Chop etilgan' : 'Qoralama'}</td>
                  <td>
                    <Link className="hu-btn hu-btn-secondary" to={`/${p.slug}`} target="_blank">
                      Koʻrish
                    </Link>{' '}
                    <button className="hu-btn hu-btn-danger" type="button" onClick={() => remove(p)}>
                      Oʻchirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="hu-btn hu-btn-secondary"
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              &larr; Oldingi
            </button>
            <span style={{ fontSize: 14 }}>
              {page} / {data.totalPages || 1}
            </span>
            <button
              className="hu-btn hu-btn-secondary"
              type="button"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Keyingi &rarr;
            </button>
          </div>
        </>
      )}
    </>
  );
}
