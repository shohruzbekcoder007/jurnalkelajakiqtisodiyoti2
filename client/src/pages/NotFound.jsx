import { Link } from 'react-router-dom';
import { SITE_TITLE } from '../config.js';
import { useEffect } from 'react';

export function NotFoundBody() {
  return (
    <main className="content" id="content">
      <div className="page-title hu-pad group">
        <h2>
          404 <span className="hu-blog-subheading">Sahifa topilmadi</span>
        </h2>
      </div>
      <div className="hu-pad group">
        <article className="post type-post">
          <div className="post-inner group">
            <div className="entry themeform">
              <div className="entry-inner">
                <p>Kechirasiz, siz izlayotgan sahifa mavjud emas yoki koʻchirilgan.</p>
                <p>
                  <Link to="/">&larr; Bosh sahifaga qaytish</Link>
                </p>
              </div>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}

export default function NotFound() {
  useEffect(() => {
    document.title = `Sahifa topilmadi | ${SITE_TITLE}`;
  }, []);
  return <NotFoundBody />;
}
