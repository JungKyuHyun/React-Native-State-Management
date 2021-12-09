import {useMemo} from 'react';
import {useRecoilCallback, useSetRecoilState} from 'recoil';
import {nextTodoId, todosState} from '../atoms/todos';

export default function useTodosActions() {
  const set = useSetRecoilState(todosState);
  const add = useRecoilCallback(
    ({snapshot}) =>
      async (text: string) => {
        const nextId = await snapshot.getPromise(nextTodoId);
        set(prev => prev.concat({id: nextId.toString(), text, done: false}));
      },
    [],
  );

  return useMemo(
    () => ({
      add,
      remove: (id: string) => set(prev => prev.filter(todo => todo.id !== id)),
      toggle: (id: string) =>
        set(prev =>
          prev.map(todo =>
            todo.id === id ? {...todo, done: !todo.done} : todo,
          ),
        ),
    }),
    [add, set],
  );
}
