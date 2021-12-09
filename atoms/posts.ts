import {SerializedError} from '@reduxjs/toolkit';
import {atom} from 'recoil';
import {Post} from '../api/types';

interface PostsState {
  loading: boolean;
  data: Post[] | null;
  error: SerializedError | null;
}

export const postsState = atom<PostsState>({
  key: 'postsState',
  default: {
    loading: false,
    data: null,
    error: null,
  },
});
