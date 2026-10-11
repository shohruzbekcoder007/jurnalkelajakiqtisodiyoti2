/**
 * Post and page titles come out of WordPress as rendered HTML — a number of
 * this journal's titles are wrapped in <strong> — so they are printed as
 * markup, the way the original theme does, rather than escaped.
 */
export default function Html({ html, as: Tag = 'span', ...rest }) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: html || '' }} />;
}
