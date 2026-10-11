import { Link } from 'react-router-dom';

/**
 * Matches `.pagination` from the theme: a plain previous / next pair,
 * "Keyingi sahifa →" and "← Oldingi sahifa".
 */
export default function Pagination({ page, totalPages, basePath = '' }) {
  if (totalPages <= 1) return null;

  const url = (p) => (p <= 1 ? `${basePath}/` : `${basePath}/page/${p}`);

  return (
    <nav className="pagination group">
      <ul className="group">
        <li className="prev left">
          {page > 1 && <Link to={url(page - 1)}>&larr; Oldingi sahifa</Link>}
        </li>
        <li className="next right">
          {page < totalPages && <Link to={url(page + 1)}>Keyingi sahifa &rarr;</Link>}
        </li>
      </ul>
    </nav>
  );
}
