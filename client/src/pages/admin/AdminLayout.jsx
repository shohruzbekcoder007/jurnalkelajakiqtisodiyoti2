import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const LINKS = [
  { to: '/admin', label: 'Boshqaruv paneli', end: true },
  { to: '/admin/posts', label: 'Maqolalar' },
  { to: '/admin/pages', label: 'Sahifalar' },
  { to: '/admin/categories', label: 'Ruknlar' },
  { to: '/admin/comments', label: 'Izohlar' },
  { to: '/admin/submissions', label: 'Kelgan maqolalar' }
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="hu-admin">
      <div className="hu-admin-bar">
        <NavLink to="/">
          <i className="fas fa-home" /> Saytni koʻrish
        </NavLink>
        <span>
          {user?.displayName || user?.username}{' '}
          <button
            type="button"
            onClick={signOut}
            style={{
              background: 'none',
              border: 'none',
              color: '#eee',
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: 'inherit'
            }}
          >
            · Chiqish
          </button>
        </span>
      </div>

      <div className="hu-admin-body">
        <nav className="hu-admin-nav">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <main className="hu-admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
