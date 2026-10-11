import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminComments,
  adminPosts,
  adminSubmissions,
  fetchCategories,
  fetchPages
} from '../../api/client.js';
import { formatDate } from '../../utils/format.js';

export default function Dashboard() {
  const [stats, setStats] = useState({ posts: 0, pages: 0, categories: 0, comments: 0, submissions: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([
      adminPosts({ per_page: 8 }),
      fetchPages(),
      fetchCategories(),
      adminComments().catch(() => ({ comments: [] })),
      adminSubmissions().catch(() => ({ submissions: [] }))
    ])
      .then(([p, pg, c, cm, sb]) => {
        setStats({
          posts: p.total || 0,
          pages: (pg.pages || []).length,
          categories: (c.categories || []).length,
          comments: (cm.comments || []).length,
          submissions: (sb.submissions || []).length
        });
        setRecent(p.posts || []);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <h1>Boshqaruv paneli</h1>

      <div className="hu-admin-cards">
        <div className="hu-admin-card">
          <div className="n">{stats.posts}</div>
          <div className="l">Maqola</div>
        </div>
        <div className="hu-admin-card">
          <div className="n">{stats.pages}</div>
          <div className="l">Sahifa</div>
        </div>
        <div className="hu-admin-card">
          <div className="n">{stats.categories}</div>
          <div className="l">Rukn</div>
        </div>
        <div className="hu-admin-card">
          <div className="n">{stats.comments}</div>
          <div className="l">Izoh</div>
        </div>
        <div className="hu-admin-card">
          <div className="n">{stats.submissions}</div>
          <div className="l">Kelgan maqola</div>
        </div>
      </div>

      <p style={{ marginBottom: 14 }}>
        <Link className="hu-btn" to="/admin/posts/new">
          + Yangi maqola
        </Link>
      </p>

      <h1 style={{ fontSize: 18 }}>Soʻnggi maqolalar</h1>
      <table className="hu-admin-table">
        <thead>
          <tr>
            <th>Sarlavha</th>
            <th style={{ width: 190 }}>Rukn</th>
            <th style={{ width: 140 }}>Sana</th>
          </tr>
        </thead>
        <tbody>
          {recent.map((p) => (
            <tr key={p._id}>
              <td>
                <Link to={`/admin/posts/${p._id}`}>{p.title}</Link>
              </td>
              <td>{(p.categories || []).map((c) => c.name).join(', ')}</td>
              <td>{formatDate(p.date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
