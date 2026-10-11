import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  adminGetPost,
  createPost,
  fetchCategories,
  updatePost
} from '../../api/client.js';

const EMPTY = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  categories: [],
  status: 'publish',
  date: ''
};

const toDateInput = (value) => {
  const d = value ? new Date(value) : new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export default function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState({ ...EMPTY, date: toDateInput() });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!isNew);
  const [state, setState] = useState({ saving: false, error: '', message: '' });

  useEffect(() => {
    fetchCategories()
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isNew) return;
    adminGetPost(id)
      .then(({ post }) =>
        setForm({
          title: post.title || '',
          slug: post.slug || '',
          content: post.content || '',
          excerpt: post.excerpt || '',
          categories: (post.categories || []).map((c) => c._id),
          status: post.status || 'publish',
          date: toDateInput(post.date)
        })
      )
      .catch(() => setState((s) => ({ ...s, error: 'Maqola yuklanmadi' })))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleCategory = (catId) =>
    setForm((f) => ({
      ...f,
      categories: f.categories.includes(catId)
        ? f.categories.filter((c) => c !== catId)
        : [...f.categories, catId]
    }));

  const submit = async (e) => {
    e.preventDefault();
    setState({ saving: true, error: '', message: '' });
    try {
      const payload = { ...form, date: form.date ? new Date(form.date).toISOString() : undefined };
      if (isNew) {
        const created = await createPost(payload);
        navigate(`/admin/posts/${created._id}`, { replace: true });
        setState({ saving: false, error: '', message: 'Maqola yaratildi' });
      } else {
        await updatePost(id, payload);
        setState({ saving: false, error: '', message: 'Saqlandi' });
      }
    } catch (err) {
      setState({
        saving: false,
        error: err.response?.data?.message || 'Saqlanmadi',
        message: ''
      });
    }
  };

  if (loading) return <p className="hu-loading">Yuklanmoqda...</p>;

  return (
    <>
      <h1>{isNew ? 'Yangi maqola' : 'Maqolani tahrirlash'}</h1>

      {state.error && <div className="hu-alert hu-alert-error">{state.error}</div>}
      {state.message && <div className="hu-alert hu-alert-success">{state.message}</div>}

      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 520px', minWidth: 300 }}>
            <div className="hu-form-row">
              <label htmlFor="p-title">Sarlavha</label>
              <input id="p-title" name="title" value={form.title} onChange={change} required />
            </div>

            <div className="hu-form-row">
              <label htmlFor="p-content">Matn (HTML)</label>
              <textarea id="p-content" name="content" value={form.content} onChange={change} />
            </div>

            <div className="hu-form-row">
              <label htmlFor="p-excerpt">
                Qisqacha (boʻsh qoldirilsa matndan avtomatik olinadi)
              </label>
              <textarea
                id="p-excerpt"
                name="excerpt"
                rows="3"
                style={{ minHeight: 80 }}
                value={form.excerpt}
                onChange={change}
              />
            </div>
          </div>

          <div style={{ flex: '0 0 260px' }}>
            <div className="hu-admin-card">
              <div className="hu-form-row">
                <label htmlFor="p-status">Holat</label>
                <select id="p-status" name="status" value={form.status} onChange={change}>
                  <option value="publish">Chop etilgan</option>
                  <option value="draft">Qoralama</option>
                </select>
              </div>

              <div className="hu-form-row">
                <label htmlFor="p-date">Sana</label>
                <input id="p-date" name="date" type="date" value={form.date} onChange={change} />
              </div>

              <div className="hu-form-row">
                <label htmlFor="p-slug">Slug</label>
                <input
                  id="p-slug"
                  name="slug"
                  value={form.slug}
                  onChange={change}
                  placeholder="avtomatik"
                />
              </div>

              <button className="hu-btn" type="submit" disabled={state.saving} style={{ width: '100%' }}>
                {state.saving ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>

              <p style={{ marginTop: 10, fontSize: 14 }}>
                <Link to="/admin/posts">&larr; Roʻyxatga qaytish</Link>
              </p>
            </div>

            <div className="hu-admin-card" style={{ marginTop: 16 }}>
              <strong style={{ display: 'block', marginBottom: 8 }}>Ruknlar</strong>
              <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                {categories.map((c) => (
                  <label key={c._id} style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>
                    <input
                      type="checkbox"
                      checked={form.categories.includes(c._id)}
                      onChange={() => toggleCategory(c._id)}
                      style={{ width: 'auto', marginRight: 6 }}
                    />
                    {c.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
