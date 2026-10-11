import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { SidebarLeft, SidebarRight } from './Sidebars.jsx';
import { useSite } from '../context/SiteContext.jsx';

// Mirrors the body classes the original page ships with
const BODY_CLASSES = [
  'wp-embed-responsive',
  'col-3cm',
  'full-width',
  'topbar-enabled',
  'header-desktop-sticky',
  'header-mobile-sticky',
  'hu-header-img-natural-height'
];

export default function Layout() {
  const { menuPages } = useSite();
  const location = useLocation();

  useEffect(() => {
    document.body.classList.add(...BODY_CLASSES);
    return () => document.body.classList.remove(...BODY_CLASSES);
  }, []);

  // The home listing keeps the `home blog` classes the theme styles against
  useEffect(() => {
    const isHome = location.pathname === '/' || /^\/page\/\d+$/.test(location.pathname);
    document.body.classList.toggle('home', isHome);
    document.body.classList.toggle('blog', isHome);
  }, [location.pathname]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  return (
    <div id="wrapper">
      <a className="screen-reader-text skip-link" href="#content">
        Skip to content
      </a>

      <Header menuPages={menuPages} />

      <div className="container" id="page">
        <div className="container-inner">
          <div className="main">
            <div className="main-inner group">
              <Outlet />
              <SidebarLeft />
              <SidebarRight />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
