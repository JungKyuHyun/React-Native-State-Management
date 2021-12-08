import {createSlice, nanoid, PayloadAction} from '@reduxjs/toolkit';

export interface Todo {
  id: string;
  text: string;
  done: boolean;
}

const initialState: Todo[] = [
  {id: '1', text: 'RN 배우기', done: true},
  {id: '2', text: 'React 배우기', done: false},
  {id: '3', text: 'React Redux 배우기', done: false},
];

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    add: {
      // @see https://redux-toolkit.js.org/api/createSlice#customizing-generated-action-creators
      prepare(text: string) {
        return {payload: {id: nanoid(), text}};
      },
      reducer(state, action: PayloadAction<{id: string; text: string}>) {
        state.push({
          ...action.payload,
          done: false,
        });
      },
    },
    remove(state, action: PayloadAction<string>) {
      return state.filter(todo => todo.id !== action.payload);
    },
    toggle(state, action: PayloadAction<string>) {
      const selected = state.find(todo => todo.id === action.payload);
      if (selected === undefined) {
        return;
      }
      selected.done = !selected.done;
    },
  },
});

export const {add, remove, toggle} = todoSlice.actions;
export default todoSlice.reducer;
