import {useMemo} from 'react';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import {nextTodoId, todosState} from '../atoms/todos';

export default function useTodosActions() {
  const set = useSetRecoilState(todosState);
  const nextId = useRecoilValue(nextTodoId);

  return useMemo(
    () => ({
      add: (text: string) =>
        set(prev => prev.concat({id: nextId.toString(), text, done: false})),
      remove: (id: string) => set(prev => prev.filter(todo => todo.id !== id)),
      toggle: (id: string) =>
        set(prev =>
          prev.map(todo =>
            todo.id === id ? {...todo, done: !todo.done} : todo,
          ),
        ),
    }),
    [nextId, set],
  );
}
