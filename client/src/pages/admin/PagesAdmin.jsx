import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deletePage, fetchPages } from '../../api/client.js';

export default function PagesAdmin() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchPages()
      .then((d) => setPages(d.pages || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const remove = async (page) => {
    if (!window.confirm(`"${page.title}" sahifasi oʻchirilsinmi?`)) return;
    await deletePage(page._id);
    load();
  };

  return (
    <>
      <h1>
        Sahifalar{' '}
        <Link className="hu-btn" to="/admin/pages/new" style={{ fontSize: 13, marginLeft: 8 }}>
          + Yangi
        </Link>
      </h1>

      {loading ? (
        <p className="hu-loading">Yuklanmoqda...</p>
      ) : (
        <table className="hu-admin-table">
          <thead>
            <tr>
              <th>Sarlavha</th>
              <th style={{ width: 240 }}>Slug</th>
              <th style={{ width: 110 }}>Menyuda</th>
              <th style={{ width: 90 }}>Tartib</th>
              <th style={{ width: 170 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p._id}>
                <td>
                  <Link to={`/admin/pages/${p._id}`}>{p.title}</Link>
                </td>
                <td>/{p.slug}</td>
                <td>{p.showInMenu ? 'Ha' : "Yo'q"}</td>
                <td>{p.menuOrder}</td>
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
      )}
    </>
  );
}
