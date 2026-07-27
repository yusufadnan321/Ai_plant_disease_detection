import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const RouterContext = createContext(null);

function parseHash() {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return hash.startsWith('/') ? hash : '/' + hash;
}

export function RouterProvider({ children }) {
  const [path, setPath] = useState(parseHash());

  useEffect(() => {
    const onChange = () => {
      setPath(parseHash());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to) => {
    const target = to.startsWith('/') ? to : '/' + to;
    if (parseHash() === target) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = target;
  }, []);

  const pathSegments = path.split('/').filter(Boolean);

  return (
    <RouterContext.Provider value={{ path, navigate, pathSegments }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}
