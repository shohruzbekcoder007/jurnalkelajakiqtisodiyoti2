import { useParams } from 'react-router-dom';
import Single from './Single.jsx';
import PageView from './PageView.jsx';
import { useSite } from '../context/SiteContext.jsx';

/**
 * WordPress serves both posts and pages off the site root, so a single
 * segment can be either. The page list is already in context, so the choice
 * costs no extra request.
 */
export default function SlugResolver() {
  const { slug } = useParams();
  const { pages, ready } = useSite();

  if (!ready) {
    return (
      <main className="content" id="content">
        <div className="hu-pad group">
          <p className="hu-loading">Yuklanmoqda...</p>
        </div>
      </main>
    );
  }

  const isPage = pages.some((p) => p.slug === slug);
  return isPage ? <PageView slug={slug} /> : <Single slug={slug} />;
}
