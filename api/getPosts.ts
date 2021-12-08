import axios from 'axios';
import {Post} from './types';

export async function getPosts() {
  const res = await axios.get<Post[]>(
    'https://jsonplaceholder.typicode.com/posts',
  );
  return res.data;
}
