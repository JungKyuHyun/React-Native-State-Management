import {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchPosts} from '../slices/posts';

interface Options {
  enabled?: boolean;
}

export default function usePosts({enabled = true}: Options = {}) {
  const posts = useSelector(state => state.posts.posts);
  const dispatch = useDispatch();

  const fetchData = useCallback(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    fetchData();
  }, [enabled, fetchData]);

  return {
    ...posts,
    refetch: fetchData,
  };
}
