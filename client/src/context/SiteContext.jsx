import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCategories, fetchPages } from '../api/client.js';

const SiteContext = createContext({ pages: [], menuPages: [], categories: [], ready: false });

export function SiteProvider({ children }) {
  const [pages, setPages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([fetchPages(), fetchCategories()])
      .then(([p, c]) => {
        if (!alive) return;
        setPages(p.pages || []);
        setCategories(c.categories || []);
      })
      .catch(() => {})
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const value = useMemo(
    () => ({ pages, menuPages: pages.filter((p) => p.showInMenu), categories, ready }),
    [pages, categories, ready]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export const useSite = () => useContext(SiteContext);

export default SiteContext;
