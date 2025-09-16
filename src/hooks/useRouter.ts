import { useState, useEffect } from 'react';

export interface RouteParams {
  bucket: string;
  token: string;
}

export interface Route {
  path: string;
  params: RouteParams;
}

export const useRouter = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>(() =>
    parseCurrentRoute()
  );

  function parseCurrentRoute(): Route {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    // Parse /bucket/{bucket} pattern
    const bucketMatch = path.match(/^\/bucket\/([^\/]+)$/);

    if (bucketMatch) {
      return {
        path: '/bucket',
        params: {
          bucket: bucketMatch[1],
          token: searchParams.get('token') || '',
        },
      };
    }

    // Default route (home)
    return {
      path: '/',
      params: {
        bucket: '',
        token: '',
      },
    };
  }

  const navigate = (path: string, params?: RouteParams) => {
    let url = path;

    if (path === '/bucket' && params?.bucket) {
      url = `/bucket/${params.bucket}`;
      if (params.token) {
        url += `?token=${encodeURIComponent(params.token)}`;
      }
    }

    window.history.pushState({}, '', url);
    setCurrentRoute({ path, params: params || { bucket: '', token: '' } });
  };

  const goHome = () => {
    navigate('/');
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(parseCurrentRoute());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    currentRoute,
    navigate,
    goHome,
    isHome: currentRoute.path === '/',
    isBucketView: currentRoute.path === '/bucket',
  };
};
