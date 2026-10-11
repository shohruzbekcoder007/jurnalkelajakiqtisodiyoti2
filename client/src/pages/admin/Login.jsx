import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { SITE_TITLE } from '../../config.js';

export default function AdminLogin() {
  const { user, login, checking } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = `Kirish | ${SITE_TITLE}`;
  }, []);

  if (!checking && user) {
    return <Navigate to={location.state?.from?.pathname || '/admin'} replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate(location.state?.from?.pathname || '/admin', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Kirish amalga oshmadi');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="hu-admin">
      <div className="hu-login-box">
        <h1>Tahririyat paneli</h1>

        {error && <div className="hu-alert hu-alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="hu-form-row">
            <label htmlFor="l-user">Login yoki e-mail</label>
            <input
              id="l-user"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="hu-form-row">
            <label htmlFor="l-pass">Parol</label>
            <input
              id="l-pass"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="hu-btn" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Tekshirilmoqda...' : 'Kirish'}
          </button>
        </form>

        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 14 }}>
          <Link to="/">&larr; Saytga qaytish</Link>
        </p>
      </div>
    </div>
  );
}
