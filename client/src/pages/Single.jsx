import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Html from '../components/Html.jsx';
import { fetchComments, fetchPost, postComment } from '../api/client.js';
import PostThumb from '../components/PostThumb.jsx';
import { SITE_TITLE } from '../config.js';
import { formatDate, stripTags } from '../utils/format.js';

function RelatedPosts({ posts }) {
  if (!posts?.length) return null;
  return (
    <>
      <h4 className="heading">
        <i className="far fa-hand-point-right" />
        You may also like...
      </h4>
      <ul className="related-posts group">
        {posts.map((p) => (
          <li className="related post-hover" key={p._id}>
            <article className="post type-post status-publish format-standard hentry">
              <PostThumb post={p} />
              <div className="post-meta group">
                <p className="post-date">{formatDate(p.date)}</p>
              </div>
              <h3 className="post-title">
                <Link to={`/${p.slug}`} rel="bookmark">
                  <Html html={p.title} />
                </Link>
              </h3>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}

function CommentForm({ slug, onPosted }) {
  const [form, setForm] = useState({ author: '', email: '', website: '', content: '' });
  const [state, setState] = useState({ sending: false, message: '', error: '' });

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setState({ sending: true, message: '', error: '' });
    try {
      const res = await postComment({ slug, ...form });
      setForm({ author: '', email: '', website: '', content: '' });
      setState({ sending: false, message: res.message, error: '' });
      onPosted?.();
    } catch (err) {
      setState({
        sending: false,
        message: '',
        error: err.response?.data?.message || 'Izoh yuborilmadi'
      });
    }
  };

  return (
    <div id="respond" className="themeform">
      <h3 className="heading">Fikr bildirish</h3>

      {state.message && <div className="hu-alert hu-alert-success">{state.message}</div>}
      {state.error && <div className="hu-alert hu-alert-error">{state.error}</div>}

      <form onSubmit={submit}>
        <div className="hu-form-row">
          <label htmlFor="c-author">
            Ism <span className="required">*</span>
          </label>
          <input
            id="c-author"
            name="author"
            type="text"
            value={form.author}
            onChange={change}
            required
          />
        </div>
        <div className="hu-form-row">
          <label htmlFor="c-email">
            E-mail <span className="required">*</span>
          </label>
          <input
            id="c-email"
            name="email"
            type="email"
            value={form.email}
            onChange={change}
            required
          />
        </div>
        <div className="hu-form-row">
          <label htmlFor="c-website">Veb-sayt</label>
          <input id="c-website" name="website" type="text" value={form.website} onChange={change} />
        </div>
        <div className="hu-form-row">
          <label htmlFor="c-content">
            Izoh <span className="required">*</span>
          </label>
          <textarea
            id="c-content"
            name="content"
            rows="6"
            value={form.content}
            onChange={change}
            required
          />
        </div>
        <input type="submit" value={state.sending ? 'Yuborilmoqda...' : 'Yuborish'} disabled={state.sending} />
        <p className="hu-form-note">Izohlar moderatsiyadan soʻng chop etiladi.</p>
      </form>
    </div>
  );
}

export default function Single({ slug }) {
  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadComments = () => {
    fetchComments(slug)
      .then((d) => setComments(d.comments || []))
      .catch(() => setComments([]));
  };

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(false);
    fetchPost(slug)
      .then((d) => {
        if (!alive) return;
        setData(d);
        document.title = `${stripTags(d.post.title)} | ${SITE_TITLE}`;
      })
      .catch(() => alive && setError(true))
      .finally(() => alive && setLoading(false));
    loadComments();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  if (error || !data) {
    return (
      <main className="content" id="content">
        <div className="page-title hu-pad group">
          <h2>Maqola topilmadi</h2>
        </div>
        <div className="hu-pad group">
          <p>
            Soʻralgan sahifa mavjud emas. <Link to="/">Bosh sahifaga qaytish</Link>
          </p>
        </div>
      </main>
    );
  }

  const { post, prev, next, related } = data;

  return (
    <main className="content" id="content">
      <div className="page-title hu-pad group">
        <ul className="meta-single group">
          <li className="category">
            {post.categories?.map((c, i) => (
              <span key={c._id}>
                {i > 0 && <span> / </span>}
                <Link to={`/category/${c.slug}`} rel="category tag">
                  {c.name}
                </Link>
              </span>
            ))}
          </li>
          <li className="comments">
            <a href="#respond">
              <i className="far fa-comments" />
              {comments.length}
            </a>
          </li>
        </ul>
      </div>

      <div className="hu-pad group">
        <article className="post type-post status-publish format-standard hentry">
          <div className="post-inner group">
            <Html as="h1" className="post-title entry-title" html={post.title} />

            <p className="post-byline">
              by{' '}
              <span className="vcard author">
                <span className="fn">
                  <Link to={`/author/${post.author}`} rel="author">
                    {post.author}
                  </Link>
                </span>
              </span>{' '}
              &middot; <span className="published">{formatDate(post.date)}</span>
            </p>

            <div className="clear" />

            <div className="entry themeform">
              <div
                className="entry-inner"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              <div className="clear" />
            </div>
          </div>
        </article>

        <div className="clear" />

        <ul className="post-nav group">
          {next && (
            <li className="next">
              <strong>Next story&nbsp;</strong>
              <Link to={`/${next.slug}`} rel="next">
                <i className="fas fa-chevron-right" />
                <Html html={next.title} />
              </Link>
            </li>
          )}
          {prev && (
            <li className="previous">
              <strong>Previous story&nbsp;</strong>
              <Link to={`/${prev.slug}`} rel="prev">
                <i className="fas fa-chevron-left" />
                <Html html={prev.title} />
              </Link>
            </li>
          )}
        </ul>

        <RelatedPosts posts={related} />

        <div id="comments" className="themeform">
          {comments.length > 0 && (
            <>
              <h3 className="heading">
                {comments.length} ta izoh
              </h3>
              <ol className="commentlist">
                {comments.map((c) => (
                  <li className="comment" key={c._id}>
                    <div className="comment-body">
                      <div className="comment-meta">
                        <span className="comment-author">{c.author}</span>{' '}
                        <span className="comment-date">{formatDate(c.date)}</span>
                      </div>
                      <div className="comment-content">
                        <p>{c.content}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          <CommentForm slug={slug} onPosted={loadComments} />
        </div>
      </div>
    </main>
  );
}
