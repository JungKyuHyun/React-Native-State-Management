import {atom, selector} from 'recoil';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

export const todosState = atom({
  key: 'todosState',
  default: [
    {id: '1', text: 'RN 배우기', done: true},
    {id: '2', text: 'React 배우기', done: false},
    {id: '3', text: 'React Redux 배우기', done: false},
  ],
});

export const nextTodoId = selector({
  key: 'nextTodoId',
  get: ({get}) => {
    const todos = get(todosState);
    const lastId = todos[todos.length - 1]?.id ?? '0';
    return +lastId + 1;
  },
});
