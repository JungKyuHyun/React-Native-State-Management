import {useCallback, useEffect} from 'react';
import {useRecoilState} from 'recoil';
import {getPosts} from '../api/getPosts';
import {postsState} from '../atoms/posts';

interface Options {
  enabled?: boolean;
}

export default function usePosts({enabled = true}: Options = {}) {
  const [{loading, data, error}, set] = useRecoilState(postsState);

  const fetchData = useCallback(async () => {
    set({loading: true, data: null, error: null});
    try {
      const posts = await getPosts();
      set({loading: false, data: posts, error: null});
    } catch (err) {
      if (err instanceof Error) {
        set({loading: false, data: null, error: err});
      }
    }
  }, [set]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    fetchData();
  }, [enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
