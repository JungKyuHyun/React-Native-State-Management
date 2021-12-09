# React Native에서 상태 관리

상태 관리라는 주제는 RN에 국한된 내용은 아니다. `typescript`를 기반으로 여러 방법을 복습겸 테스트 해보자. 더 나아가 아직 사용해보지 않는 `recoil` 라이브러리도 경험해 보자.

아래에서 배운 내용은 대부분 생략한다.

- [설치 및 할일 만들기](https://ajdkfl6445.gitbook.io/study/mobile/react-native/install)
- [내비게이션, Hooks](https://ajdkfl6445.gitbook.io/study/mobile/react-native/hooks)
- [다이어리 앱 만들기](https://github.com/JungKyuHyun/React-Native-Study-Diary-App)
- [React Native With Typescript](https://github.com/JungKyuHyun/React-Native-Study-Typescript)

## Getting Start

```bash
$ npx react-native init StateManagementInReactNative --template react-native-template-typescript
```

<hr />

# 1. Redux Toolkit (RTK)

`typescript`에서 `redux`를 사용하려고 하니, 너무 많은 타이핑과 구조체들이 필요해서 실제로 프로덕션 환경에서 도입하여 사용해본 반가운 라이브러리다. (참고: [공식문서](https://redux-toolkit.js.org/introduction/getting-started))

오랫만에 다시 보자 [리덕스의 개념 및 데이터 흐름](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow)!

![ReduxDataFlowDiagram-49fa8c3968371d9ef6f2a1486bd40a26](https://user-images.githubusercontent.com/42884032/145078489-90c24120-7e8a-410e-b2e5-f7d6ea03f6ae.gif)

## 설치

```bash
$ yarn add redux react-redux @reduxjs/toolkit
$ yarn add -D @types/react-redux
```

## 기본 구현체

사용자의 인증 상태를 관리할 `authSlice` 생성.

```typescript
// slices/auth.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export interface User {
  id: number;
  username: string;
  displayName: string;
}

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authorize(state, action: PayloadAction<User>) {
      state.user = action.payload;
    },
    logout(state) {
      state.user = null;
    },
  },
});

export default authSlice.reducer;
export const {authorize, logout} = authSlice.actions;
```

`rootReducer` 생성

```typescript
// slices/index.ts
import {combineReducers} from 'redux';
import auth from './auth';

const rootReducer = combineReducers({
  auth,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
```

스토어 추가

```typescript
import React from 'react';
import {Provider} from 'react-redux';
import {createStore} from 'redux';
import rootReducer from './slices';

const store = createStore(rootReducer);

function App() {
  return <Provider store={store}>{/* ... */}</Provider>;
}

export default App;
```

## 상태 가져오기

`useSelector` 사용

```typescript
function AuthStatus() {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <View style={styles.status}>
      <Text style={styles.text}>
        {user != null ? user.displayName : '로그인하세요'}
      </Text>
    </View>
  );
}
```

## 액션 함수 전달하기

`useDispatch` 훅으로 `dispatch` 함수를 얻고 필요할때 `dispatch` 함수로 액션 함수 전달. (다시 한번 더 읽기 [리덕스의 핵심 개념 및 원리](https://redux.js.org/tutorials/fundamentals/part-2-concepts-data-flow#core-concepts-and-principles)!)

```typescript
function AuthButtons() {
  const dispatch = useDispatch();
  const onPressLogin = () => {
    dispatch(
      authorize({
        id: 1,
        username: 'JungKyuHyun',
        displayName: 'Jacob',
      }),
    );
  };
  const onPressLogout = () => {
    dispatch(logout());
  };

  return (
    <View>
      <Button title="로그인" onPress={onPressLogin} />
      <Button title="로그아웃" onPress={onPressLogout} />
    </View>
  );
}
```

![2021-12-08_02-25-31 (1)](https://user-images.githubusercontent.com/42884032/145077021-f3ec0199-5aef-48f8-95cb-b87813f6efc0.gif)

## useSelector 사용시 RootState 없이 타입 추론되게 하기

다시 공부하면서 발견한 내용이다. 매번 `RootState` 타입을 가져왔었는데 이런 방법이 존재했네;;

```typescript
// slices/index.ts
// ...
export type RootState = ReturnType<typeof rootReducer>;

// <-- here! --->
declare module 'react-redux' {
  interface DefaultRootState extends RootState {}
}

export default rootReducer;
```

![image](https://user-images.githubusercontent.com/42884032/145079434-a41f3758-8609-41f7-91c8-3c2e429e1710.png)

## 리덕스와 연동하는 로직을 Hook으로 분리

리덕스의 상태를 다루는 로직과 컴포넌트의 UI로직을 분리하자. (나중에 상태 관리 라이브러리 마이그레이션할 때도 편하며, 커스텀 훅으로 만들면 재사용도 가능해 진다.)

먼저 `AuthStatus.tsx`에서 사용했던 스토어로부터 상태를 가져오던 부분을 커스텀 훅으로 만들었다.

```typescript
// hooks/useUser.ts
export default function useUser() {
  return useSelector(state => state.auth.user);
}
```

`AuthButtons.tsx`에서 사용하던 리덕스 부분을 분리했다.

```typescript
// hooks/useAuthActions.ts
// 1번 방법
export default function useAuthActions() {
  const dispatch = useDispatch();
  return {
    authorize: (user: User) => dispatch(authorize(user)),
    logout: () => dispatch(logout()),
  };
}
```

1번 방법은 직접 타이핑 해보면 알겠지만, `dispatch`하기 위해 한번 더 랩핑하는 과정이 귀찮다.

```typescript
// hooks/useAuthActions.ts
// 2번 방법
export default function useAuthActions() {
  const dispatch = useDispatch();
  return bindActionCreators({authorize, logout}, dispatch);
}
```

2번 방법의 경우 제공되는 유틸함수 이용(`bindActionCreators`)를 이용했다. 훨씬도 간결하고 깔끔해 졌다.
또한 각 액션 생성 함수들의 파라미터 타입을 따로 알지 않아도 되기 때문에 편하다.

```typescript
// hooks/useAuthActions.ts
// 3번 방법
export default function useAuthActions() {
  const dispatch = useDispatch();
  return useMemo(
    () => bindActionCreators({authorize, logout}, dispatch),
    [dispatch],
  );
}
```

3번 방법은 2번 방법을 최적화한 것이다.
이 훅에서는 컴포넌트가 새로 렌더링될 때마다 `bindActionCreators`가 호출되어 각 함수들이 새로 선언되게 되는데, 그 함수가 `useEffect`에서 사용하게 되면 의도치 않은 버그가 생길 수 있기 때문에 `useMemo`를 사용해 준다.

<hr />

## 리덕스로 할일 목록 만들기

Redux Toolkit을 사용할 때는 불변성을 유지하지 않아도 자동으로 관리되기 때문에 push, slice 등의 함수를 사용해도 괜찮다.
**다만 리듀서에서 반환하는 값이 없을 때는 라이브러리에서 불변성 유지를 자동으로 해주지만, 값을 반환한다면 불변성 자동 관리가 생략된다.**

```typescript
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
```

![2021-12-08_22-57-43 (1)](https://user-images.githubusercontent.com/42884032/145220730-0c10d24a-6d94-41e9-b8f4-f2eb5f93a6e9.gif)

<hr />

# 비동기 작업

여러가지가 존재하지만, `redux-thunk`를 통해 만들어 보자.
`redux-thunk`의 경우 함수를 기반으로 작동하며 `Redux Toolkit`에 내장되어 있다. 나는 사실 이 방법이 리덕스에서 사용하는 가장 기본적인 비동기 처리지만 이상하게 이것만 직접 사용해 본적은 없다.

리덕스를 사용할 때는 `redux-sage`, `redux-observable`으로만 비동기 처리를 했었는데 지금은 로딩, 오류 등의 상태관리가 너무 귀찮기도 하고 리덕스의 타이핑이 줄어도 많기도 하여, `react-query`를 많이 사용하다 보니 더더욱 접할일이 없었다. 왜 안사용했는지도 지금은 조금 더 명확하게 알 수 있을거 같아 공부할겸 지금 해보자.

`REST API` 호출할 때는 많이 사용하는 `Axios` 라이브러리를 사용해 보겠다.

## 설치

```bash
$ yarn add axios
$ yarn add -D @types/axios
```

## 미들웨어 적용

기존 `createStore`에서 `configureStore`로 변경한다.

```typescript
import {configureStore} from '@reduxjs/toolkit';
// ...

// const store = createStore(rootReducer);
const store = configureStore({reducer: rootReducer}); // <-- here!

function App() {
  return (
    <Provider store={store}>
      <PostsApp />
    </Provider>
  );
}

export default App;
```

## 기본 사용법

`createAsyncThunk` 함수는 `Promise`를 반환하는 함수를 기반으로 함수가 호출됐을 때, 성공하거나 실패했을 때 사용할 액션들을 제공한다.
추후에 `dispatch(fetchPosts())`하면 상황별로 이 액션들이 `dispatch`된다.

```typescript
import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  SerializedError,
} from '@reduxjs/toolkit';
import {getPosts} from '../api/getPosts';
import {Post} from '../api/types';

export const fetchPosts = createAsyncThunk('posts/fetchUsers', getPosts);

interface PostsState {
  posts: {
    loading: boolean;
    data: Post[] | null;
    error: SerializedError | null;
  };
}

const initialState: PostsState = {
  posts: {
    loading: false,
    data: null,
    error: null,
  },
};

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchPosts.pending.type]: state => {
      state.posts = {
        loading: true,
        data: null,
        error: null,
      };
    },
    [fetchPosts.fulfilled.type]: (state, action: PayloadAction<Post[]>) => {
      state.posts.data = action.payload;
      state.posts.loading = false;
    },
    [fetchPosts.rejected.type]: (
      state,
      action: ReturnType<typeof fetchPosts.rejected>,
    ) => {
      state.posts.error = action.error;
      state.posts.loading = false;
    },
  },
});

export default postsSlice.reducer;
```

참고로 `createSlice`할 때 `fetchPosts`를 통하여 `dispatch`된 액션들을 처리하는 리듀서 함수들은 `extraReducers`에 작성해야 한다. 왜냐하면 이 경우에 액션 생성함수와 리듀서를 동시에 만드는게 아니라 이미 정의된 액션들의 리듀서를 작성하는 것이기 때문이다.

이번에 만들 hook은 위에 훅과 달리 상태와 액션이 동시에 필요하여 한번에 만든다.

```typescript
import {useCallback, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {fetchPosts} from '../slices/posts';

interface Props {
  enabled: boolean;
}

export default function usePosts({enabled}: Props) {
  const posts = useSelector(state => state.posts);
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
```

![2021-12-09_02-18-14 (1)](https://user-images.githubusercontent.com/42884032/145253724-ec55ff0c-0b48-4c38-9b81-df0843c16b5f.gif)

<hr />

# Recoil

`recoil`에 대한 설명이 길어져 [Recoil 기초 개념 및 사용법](https://ajdkfl6445.gitbook.io/study/react/recoil)으로 대체하겠다.

## useRecoilCallback(callback, deps)로 최적화 하기

먼저 기존에 작업된 코드를 보자.

```typescript
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
```

`useMemo`가 `nextId`에 의존하고 있어, `nextId`가 바뀔때마다 `useMemo`에 등록한 함수가 한번 더 호출되면서 새로운 객체가 만들어 지고 있다.
사실 성능적으로는 문제가 크게 없는 부분이긴 하지만, 최적화하는 법을 배울겸 수정해 보자.

[[공식문서 - useRecoilCallback](https://recoiljs.org/docs/api-reference/core/useRecoilCallback/)]

`useRecoilCallback`은 `useCallback`가 유사하지만, `recoil` 상태(`state`)에 동작하는 콜백용 api를 제공해준다.

```typescript
type CallbackInterface = {
  snapshot: Snapshot,
  gotoSnapshot: Snapshot => void,
  set: <T>(RecoilState<T>, (T => T) | T) => void,
  reset: <T>(RecoilState<T>) => void,
  transact_UNSTABLE: ((TransactionInterface) => void) => void,
};

function useRecoilCallback<Args, ReturnValue>(
  callback: CallbackInterface => (...Args) => ReturnValue,
  deps?: $ReadOnlyArray<mixed>,
): (...Args) => ReturnValue
```

위에서 보다시피 콜백 함수에는 여러 인터페이스가 제공되며, 위 경우 `snapshot`을 통해 최적화 가능하다. 스냅샷의 경우 `recoil atom state`에 대한 읽기 전용 보기를 제공하며, `Promise`형태로 반환된다.

```typescript
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
```

이렇게 하면 `nextTodoId`가 바뀔 때마다 함수들이 새로 생성되지 않고 `add` 함수가 호출될 때 그 내부에서 현재의 `nextTodoId`를 조회한 뒤 해당 값을 사용해 새로운 항목을 등록하게 된다.

<hr />

# Log

1. Redux Toolkit으로 앱 작성: f278476078e8a76817047fd5c131cee1102eaf11
2. RTK로 작성된 AuthApp을 recoil로 마이그레이션: 12f4f6a5b27a90a66759a8ab0ee3fb88303fd9d5
3. RTK로 작성된 TodoApp을 recoil로 마이그레이션: 9e6b1234ede91a7ad224f53893b3e01acb9522a2
4. ecoil로 작성한 useTodosActions 최적화: 3c5b04a0ebd79f50a4c900b9804bccd063099890
5. RTK로 작성된 PostsApp을 recoil로 마이그레이션: 2b356d6b556dad39e9a5267e314eafac24330c86

<hr />

끝!
