import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminComments, approveComment, deleteComment } from '../../api/client.js';
import { formatDate } from '../../utils/format.js';

export default function CommentsAdmin() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    adminComments()
      .then((d) => setComments(d.comments || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const toggle = async (c) => {
    await approveComment(c._id);
    load();
  };

  const remove = async (c) => {
    if (!window.confirm('Izoh oʻchirilsinmi?')) return;
    await deleteComment(c._id);
    load();
  };

  if (loading) return <p className="hu-loading">Yuklanmoqda...</p>;

  return (
    <>
      <h1>Izohlar ({comments.length})</h1>

      {comments.length === 0 ? (
        <p>Hozircha izohlar yoʻq.</p>
      ) : (
        <table className="hu-admin-table">
          <thead>
            <tr>
              <th style={{ width: 170 }}>Muallif</th>
              <th>Izoh</th>
              <th style={{ width: 200 }}>Maqola</th>
              <th style={{ width: 120 }}>Sana</th>
              <th style={{ width: 190 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {comments.map((c) => (
              <tr key={c._id}>
                <td>
                  {c.author}
                  <br />
                  <small style={{ color: '#888' }}>{c.email}</small>
                </td>
                <td>{c.content}</td>
                <td>
                  {c.post ? <Link to={`/${c.post.slug}`}>{c.post.title}</Link> : <em>oʻchirilgan</em>}
                </td>
                <td>{formatDate(c.date)}</td>
                <td>
                  <button className="hu-btn hu-btn-secondary" type="button" onClick={() => toggle(c)}>
                    {c.approved ? 'Yashirish' : 'Tasdiqlash'}
                  </button>{' '}
                  <button className="hu-btn hu-btn-danger" type="button" onClick={() => remove(c)}>
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
