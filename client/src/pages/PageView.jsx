import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPage } from '../api/client.js';
import SubmissionForm from '../components/SubmissionForm.jsx';
import Html from '../components/Html.jsx';
import { stripTags } from '../utils/format.js';
import { SITE_TITLE } from '../config.js';

export default function PageView({ slug }) {
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    fetchPage(slug)
      .then((d) => {
        if (!alive) return;
        setPage(d.page);
        document.title = `${stripTags(d.page.title)} | ${SITE_TITLE}`;
      })
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="content" id="content">
        <div className="hu-pad group">
          <p className="hu-loading">Yuklanmoqda...</p>
        </div>
      </main>
    );
  }

  if (error || !page) {
    return (
      <main className="content" id="content">
        <div className="page-title hu-pad group">
          <h2>Sahifa topilmadi</h2>
        </div>
        <div className="hu-pad group">
          <p>
            Soʻralgan sahifa mavjud emas. <Link to="/">Bosh sahifaga qaytish</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="content" id="content">
      <div className="page-title hu-pad group">
        <Html as="h1" html={page.title} />
      </div>

      <div className="hu-pad group">
        <article className="page type-page status-publish hentry">
          <div className="post-inner group">
            <div className="entry themeform">
              <div className="entry-inner" dangerouslySetInnerHTML={{ __html: page.content }} />
              <div className="clear" />
            </div>
          </div>
        </article>

        {/* The original runs a Contact Form 7 submission form on this page */}
        {page.slug === 'maqola-yuborish' && <SubmissionForm />}
      </div>
    </main>
  );
}
