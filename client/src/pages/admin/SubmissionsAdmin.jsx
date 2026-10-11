import { useCallback, useEffect, useState } from 'react';
import { adminSubmissions, deleteSubmission, updateSubmission } from '../../api/client.js';
import { formatDate } from '../../utils/format.js';

const STATUS_LABEL = {
  new: 'Yangi',
  review: 'Koʻrib chiqilmoqda',
  accepted: 'Qabul qilindi',
  rejected: 'Rad etildi'
};

export default function SubmissionsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminSubmissions()
      .then((d) => setItems(d.submissions || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const setStatus = async (item, status) => {
    await updateSubmission(item._id, { status });
    load();
  };

  const remove = async (item) => {
    if (!window.confirm('Ariza oʻchirilsinmi?')) return;
    await deleteSubmission(item._id);
    load();
  };

  if (loading) return <p className="hu-loading">Yuklanmoqda...</p>;

  return (
    <>
      <h1>Kelgan maqolalar ({items.length})</h1>

      {items.length === 0 ? (
        <p>Hozircha arizalar yoʻq.</p>
      ) : (
        <table className="hu-admin-table">
          <thead>
            <tr>
              <th style={{ width: 190 }}>Muallif</th>
              <th>Maqola sarlavhasi</th>
              <th style={{ width: 150 }}>Rukn</th>
              <th style={{ width: 120 }}>Sana</th>
              <th style={{ width: 160 }}>Holat</th>
              <th style={{ width: 170 }}>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((s) => (
              <tr key={s._id}>
                <td>
                  {s.fullName}
                  <br />
                  <small style={{ color: '#888' }}>{s.email}</small>
                  {s.phone && (
                    <>
                      <br />
                      <small style={{ color: '#888' }}>{s.phone}</small>
                    </>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => setOpen(open === s._id ? null : s._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#0073aa',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      fontSize: 14
                    }}
                  >
                    {s.title}
                  </button>
                  {open === s._id && (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#555' }}>
                      {s.workplace && (
                        <p>
                          <strong>Ish joyi:</strong> {s.workplace}
                        </p>
                      )}
                      {s.degree && (
                        <p>
                          <strong>Ilmiy daraja:</strong> {s.degree}
                        </p>
                      )}
                      {s.orcid && (
                        <p>
                          <strong>ORCID:</strong> {s.orcid}
                        </p>
                      )}
                      {s.annotation && (
                        <p>
                          <strong>Annotatsiya:</strong> {s.annotation}
                        </p>
                      )}
                      {s.keywords && (
                        <p>
                          <strong>Kalit soʻzlar:</strong> {s.keywords}
                        </p>
                      )}
                      {s.message && (
                        <p>
                          <strong>Xabar:</strong> {s.message}
                        </p>
                      )}
                    </div>
                  )}
                </td>
                <td>{s.rubric || '—'}</td>
                <td>{formatDate(s.createdAt)}</td>
                <td>
                  <select value={s.status} onChange={(e) => setStatus(s, e.target.value)}>
                    {Object.entries(STATUS_LABEL).map(([v, l]) => (
                      <option key={v} value={v}>
                        {l}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button className="hu-btn hu-btn-danger" type="button" onClick={() => remove(s)}>
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
