import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { SITE_DESCRIPTION, SITE_TITLE } from '../config.js';

function SearchForm({ onSubmitted }) {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();

  const submit = (e) => {
    e.preventDefault();
    const s = term.trim();
    if (!s) return;
    navigate(`/?s=${encodeURIComponent(s)}`);
    setTerm('');
    onSubmitted?.();
  };

  return (
    <form role="search" method="get" className="search-form" onSubmit={submit}>
      <label>
        <span className="screen-reader-text">Qidirshish:</span>
        <input
          type="search"
          className="search-field"
          placeholder="qidiruv"
          value={term}
          name="s"
          onChange={(e) => setTerm(e.target.value)}
        />
      </label>
      <input type="submit" className="search-submit" value="Izlash" />
    </form>
  );
}

export default function Header({ menuPages }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [topbarCollapsed, setTopbarCollapsed] = useState(false);
  const location = useLocation();

  // The theme flips `is-scrolled` on <body> to swap in the translucent sticky bar
  useEffect(() => {
    const onScroll = () => {
      document.body.classList.toggle('is-scrolled', window.scrollY > 1);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search]);

  const headerClass = [
    'main-menu-mobile-on',
    'one-mobile-menu',
    'main_menu',
    'header-ads-desktop',
    'topbar-transparent',
    'no-header-img'
  ].join(' ');

  return (
    <header id="header" className={headerClass}>
      {/* ------------------------------ mobile ------------------------------ */}
      <nav
        className={`nav-container group mobile-menu mobile-sticky no-menu-assigned${
          mobileOpen ? ' opened' : ''
        }`}
        id="nav-mobile"
        data-menu-id="header-1"
      >
        <div className="mobile-title-logo-in-header">
          <p className="site-title">
            <Link className="custom-logo-link" to="/" rel="home" title={`${SITE_TITLE} | Home page`}>
              {SITE_TITLE}
            </Link>
          </p>
        </div>

        <button
          className={`ham__navbar-toggler-two${mobileOpen ? '' : ' collapsed'}`}
          title="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
          type="button"
        >
          <span className="ham__navbar-span-wrapper">
            <span className="line line-1" />
            <span className="line line-2" />
            <span className="line line-3" />
          </span>
        </button>

        <div className="nav-text" />
        <div className="nav-wrap container" style={mobileOpen ? undefined : { display: 'none' }}>
          <ul className="nav container-inner group mobile-menu-list">
            <li className={location.pathname === '/' ? 'current_page_item' : ''}>
              <Link to="/">Home</Link>
            </li>
            {menuPages.map((p) => (
              <li key={p._id} className="page_item">
                <NavLink
                  to={`/${p.slug}`}
                  className={({ isActive }) => (isActive ? 'current_page_item' : '')}
                >
                  {p.title}
                </NavLink>
              </li>
            ))}
          </ul>
          <ul className="nav container-inner group mobile-search">
            <li>
              <SearchForm onSubmitted={() => setMobileOpen(false)} />
            </li>
          </ul>
        </div>
      </nav>

      {/* ------------------------------ desktop ----------------------------- */}
      <nav
        className="nav-container group desktop-menu desktop-sticky"
        id="nav-topbar"
        data-menu-id="header-2"
      >
        <div className="nav-text" />
        <div className="topbar-toggle-down">
          <i
            className="fas fa-angle-double-down"
            aria-hidden="true"
            data-toggle="down"
            title="Expand menu"
            onClick={() => setTopbarCollapsed(false)}
          />
          <i
            className="fas fa-angle-double-up"
            aria-hidden="true"
            data-toggle="up"
            title="Collapse menu"
            onClick={() => setTopbarCollapsed(true)}
          />
        </div>
        <div className="nav-wrap container" style={topbarCollapsed ? { display: 'none' } : undefined}>
          <ul className="nav container-inner group">
            <li className={location.pathname === '/' && !location.search ? 'current_page_item' : ''}>
              <Link to="/">Home</Link>
            </li>
            {menuPages.map((p) => (
              <li key={p._id} className="page_item">
                <NavLink
                  to={`/${p.slug}`}
                  className={({ isActive }) => (isActive ? 'current_page_item' : '')}
                >
                  {p.title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ----------------------------- title zone ---------------------------- */}
      <div className="container group">
        <div className="container-inner">
          <div className="group hu-pad central-header-zone">
            <div className="logo-tagline-group">
              <h1 className="site-title">
                <Link
                  className="custom-logo-link"
                  to="/"
                  rel="home"
                  title={`${SITE_TITLE} | Home page`}
                >
                  {SITE_TITLE}
                </Link>
              </h1>
              <p className="site-description">{SITE_DESCRIPTION}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
