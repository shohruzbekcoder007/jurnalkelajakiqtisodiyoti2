import { useCallback, useEffect, useState } from 'react';
import { createCategory, deleteCategory, fetchCategories, updateCategory } from '../../api/client.js';

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', description: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetchCategories()
      .then((d) => setCategories(d.categories || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) await updateCategory(editing, form);
      else await createCategory(form);
      setForm({ name: '', description: '' });
      setEditing(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Saqlanmadi');
    }
  };

  const remove = async (cat) => {
    if (!window.confirm(`"${cat.name}" rukni oʻchirilsinmi?`)) return;
    await deleteCategory(cat._id);
    load();
  };

  return (
    <>
      <h1>Ruknlar</h1>

      {error && <div className="hu-alert hu-alert-error">{error}</div>}

      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 300px' }}>
          <div className="hu-admin-card">
            <strong style={{ display: 'block', marginBottom: 10 }}>
              {editing ? 'Ruknni tahrirlash' : 'Yangi rukn'}
            </strong>
            <form onSubmit={submit}>
              <div className="hu-form-row">
                <label htmlFor="c-name">Nomi</label>
                <input
                  id="c-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="hu-form-row">
                <label htmlFor="c-desc">Izoh</label>
                <textarea
                  id="c-desc"
                  rows="3"
                  style={{ minHeight: 70 }}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <button className="hu-btn" type="submit" style={{ width: '100%' }}>
                {editing ? 'Saqlash' : 'Qoʻshish'}
              </button>
              {editing && (
                <button
                  className="hu-btn hu-btn-secondary"
                  type="button"
                  style={{ width: '100%', marginTop: 8 }}
                  onClick={() => {
                    setEditing(null);
                    setForm({ name: '', description: '' });
                  }}
                >
                  Bekor qilish
                </button>
              )}
            </form>
          </div>
        </div>

        <div style={{ flex: '1 1 420px', minWidth: 300 }}>
          {loading ? (
            <p className="hu-loading">Yuklanmoqda...</p>
          ) : (
            <table className="hu-admin-table">
              <thead>
                <tr>
                  <th>Nomi</th>
                  <th style={{ width: 200 }}>Slug</th>
                  <th style={{ width: 80 }}>Soni</th>
                  <th style={{ width: 170 }}>Amallar</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c) => (
                  <tr key={c._id}>
                    <td>{c.name}</td>
                    <td>{c.slug}</td>
                    <td>{c.count}</td>
                    <td>
                      <button
                        className="hu-btn hu-btn-secondary"
                        type="button"
                        onClick={() => {
                          setEditing(c._id);
                          setForm({ name: c.name, description: c.description || '' });
                        }}
                      >
                        Tahrirlash
                      </button>{' '}
                      <button
                        className="hu-btn hu-btn-danger"
                        type="button"
                        onClick={() => remove(c)}
                      >
                        Oʻchirish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
