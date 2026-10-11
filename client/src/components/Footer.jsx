import { COPYRIGHT_YEAR, SITE_TITLE } from '../config.js';

export default function Footer() {
  const toTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="footer">
      <section className="container" id="footer-bottom">
        <div className="container-inner">
          <a id="back-to-top" href="#" onClick={toTop}>
            <i className="fas fa-angle-up" />
          </a>

          <div className="hu-pad group">
            <div className="grid one-half">
              <div id="copyright">
                <p>
                  {SITE_TITLE} &copy; {COPYRIGHT_YEAR}. All Rights Reserved.
                </p>
              </div>

              <div id="credit">
                <p>
                  Powered by&nbsp;
                  <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
                    React
                  </a>
                  ,&nbsp;
                  <a href="https://expressjs.com/" target="_blank" rel="noopener noreferrer">
                    Express
                  </a>
                  ,&nbsp;
                  <a href="https://www.mongodb.com/" target="_blank" rel="noopener noreferrer">
                    MongoDB
                  </a>{' '}
                  &amp;&nbsp;
                  <a href="https://nodejs.org/" target="_blank" rel="noopener noreferrer">
                    Node.js
                  </a>
                </p>
              </div>
            </div>

            <div className="grid one-half last" />
          </div>
        </div>
      </section>
    </footer>
  );
}
