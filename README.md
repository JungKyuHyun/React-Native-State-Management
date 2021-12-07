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
$ yarn add redux react-redux @reduxjs/toolkit @types/react-redux
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

![image](https://user-images.githubusercontent.com/42884032/145075799-bd4e03e0-0baa-4165-bd2d-0a953ee5dd2e.png)

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

다시 공부하면서 발견한 내용이다. 매번 RootState 타입을 가져왔었는데 이런 방법이 존재했네;;

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

2번 방법의 경우 제공되는 유틸함수 이용(`bindActionCreators`)를 이용했다. 훨씬도 간결하고 깔끔해 졌으며, 타입 추론까지 된다.
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

...

<hr />

# Recoil

...