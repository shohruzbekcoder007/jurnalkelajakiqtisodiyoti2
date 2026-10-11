import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPage, fetchPage, fetchPages, updatePage } from '../../api/client.js';

const EMPTY = { title: '', slug: '', content: '', menuOrder: 0, showInMenu: true, status: 'publish' };

export default function PageEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(!isNew);
  const [state, setState] = useState({ saving: false, error: '', message: '' });

  useEffect(() => {
    if (isNew) return;
    // The page list carries the ids; the content comes from the slug endpoint.
    fetchPages()
      .then(({ pages }) => {
        const found = (pages || []).find((p) => p._id === id);
        if (!found) throw new Error('not found');
        return fetchPage(found.slug).then(({ page }) => {
          setForm({
            title: page.title || '',
            slug: page.slug || '',
            content: page.content || '',
            menuOrder: page.menuOrder ?? 0,
            showInMenu: page.showInMenu !== false,
            status: page.status || 'publish'
          });
        });
      })
      .catch(() => setState((s) => ({ ...s, error: 'Sahifa yuklanmadi' })))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setState({ saving: true, error: '', message: '' });
    try {
      const payload = { ...form, menuOrder: Number(form.menuOrder) || 0 };
      if (isNew) {
        const created = await createPage(payload);
        navigate(`/admin/pages/${created._id}`, { replace: true });
        setState({ saving: false, error: '', message: 'Sahifa yaratildi' });
      } else {
        await updatePage(id, payload);
        setState({ saving: false, error: '', message: 'Saqlandi' });
      }
    } catch (err) {
      setState({ saving: false, error: err.response?.data?.message || 'Saqlanmadi', message: '' });
    }
  };

  if (loading) return <p className="hu-loading">Yuklanmoqda...</p>;

  return (
    <>
      <h1>{isNew ? 'Yangi sahifa' : 'Sahifani tahrirlash'}</h1>

      {state.error && <div className="hu-alert hu-alert-error">{state.error}</div>}
      {state.message && <div className="hu-alert hu-alert-success">{state.message}</div>}

      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 520px', minWidth: 300 }}>
            <div className="hu-form-row">
              <label htmlFor="pg-title">Sarlavha</label>
              <input id="pg-title" name="title" value={form.title} onChange={change} required />
            </div>
            <div className="hu-form-row">
              <label htmlFor="pg-content">Matn (HTML)</label>
              <textarea id="pg-content" name="content" value={form.content} onChange={change} />
            </div>
          </div>

          <div style={{ flex: '0 0 260px' }}>
            <div className="hu-admin-card">
              <div className="hu-form-row">
                <label htmlFor="pg-slug">Slug</label>
                <input
                  id="pg-slug"
                  name="slug"
                  value={form.slug}
                  onChange={change}
                  placeholder="avtomatik"
                />
              </div>
              <div className="hu-form-row">
                <label htmlFor="pg-order">Menyu tartibi</label>
                <input
                  id="pg-order"
                  name="menuOrder"
                  type="text"
                  value={form.menuOrder}
                  onChange={change}
                />
              </div>
              <div className="hu-form-row">
                <label style={{ fontWeight: 400 }}>
                  <input
                    type="checkbox"
                    name="showInMenu"
                    checked={form.showInMenu}
                    onChange={change}
                    style={{ width: 'auto', marginRight: 6 }}
                  />
                  Menyuda koʻrsatilsin
                </label>
              </div>

              <button className="hu-btn" type="submit" disabled={state.saving} style={{ width: '100%' }}>
                {state.saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>

              <p style={{ marginTop: 10, fontSize: 14 }}>
                <Link to="/admin/pages">&larr; Roʻyxatga qaytish</Link>
              </p>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
