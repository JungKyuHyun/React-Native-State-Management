<!-- 마크다운으로 작성 후 블로그로 글 이전 -->

# Recoil

페이스북에서 만든 상태관리 라이브러리로, `useState`를 사용하는 것만큼 사용이 간단하면서 상태 관리를 효과적으로 할 수 있게 도와준다.

> Recoil lets you create a data-flow graph that flows from atoms (shared state) through selectors (pure functions) and down into your React components.

위에 말이 리코일의 핵심 개념으로 `Recoil`은 원자(`atom`, 공유 상태)에서 `selector`(순수 함수)를 거쳐 `React Componenets`로 흐르는 데이터 흐름 그래프를 만들 수 있게 해준다. 여기서 원자(`atom`)는 리액트 컴포넌트가 구독(`subscribe`)할 수 있는 상태 단위이며, `selector`는 이 상태를 동기식 또는 비동기식으로 변환한다.

## 공식 문서

https://recoiljs.org

## 기본 사용법

처음 다루다보니 조금 공식 문서를 많이 참고하여 공부하자.

### RecoilRoot

`RecoilRoot`는 리덕스의 `Provider`와 비슷한 역할을 하여 여러 개의 `RecoilRoot`가 공존할 수 있으며, `atom state`의 독립적인 공급자/저장소를 나타낼 수 있다.
컴포넌트에서 `recoil`과 연동할 때는 해당 컴포넌트와 가장 가까이 있는 `RecoilRoot`를 사용한다.

```typescript
import {RecoilRoot} from 'recoil';

function AppRoot() {
  return (
    <RecoilRoot>
      <ComponentThatUsesRecoil />
    </RecoilRoot>
  );
}
```

### atom

`atom`은 `recoil`에서 상태를 정의하는 방법이라고 생각하면 된다.

```typescript
const todoListState = atom({
  key: 'todoListState',
  default: [],
});
```

상태를 정의할 때는 고유값인 key를 설정하고, 기본값(default)을 설정하면 된다. 이렇게 정의한 atom은 `useRecoilValue`, `useSetRecoilState`, `useRecoilState`의 훅으로 사용할 수 있다.

```typescript
// 1.
const [todoList, setTodoList] = useRecoilState(todoListState);

// 2.
const todoList = useRecoilValue(todoListState);

// 3.
const setTodoList = useSetRecoilState(todoListState);
```

- `useRecoilState(todoListState)`를 사용하면 `useState()`와 같이 배열의 첫 번째 원소가 상태, 두 번째 원소가 상태를 업데이트하는 함수를 반환하게 된다.
- `useRecoilValue(todoListState)`는 상태 값만 필요할 경우에 사용하면 된다.
- `useSetRecoilState(todoListState)`는 상태를 업데이트하는 함수만 필요한 경우 사용하면 된다.

여기서 상태를 업데이트하는 함수인 `setTodoList`의 경우 `useState`의 업데이트 함수처럼 `setTodoList(todo)` 이런식으로 원하는 값을 바로 넣어 사용해도 되며, `setTodoList(prev => [todo, ...prev])` 이런식으로 현재 값을 파라미터로 받아와서 구현할 수 있다.

```typescript
// https://recoiljs.org/docs/basic-tutorial/atoms
function TodoItem({item}) {
  const [todoList, setTodoList] = useRecoilState(todoListState);
  const index = todoList.findIndex(listItem => listItem === item);

  const editItemText = ({target: {value}}) => {
    const newList = replaceItemAtIndex(todoList, index, {
      ...item,
      text: value,
    });

    setTodoList(newList);
  };

  const toggleItemCompletion = () => {
    const newList = replaceItemAtIndex(todoList, index, {
      ...item,
      isComplete: !item.isComplete,
    });

    setTodoList(newList);
  };

  const deleteItem = () => {
    const newList = removeItemAtIndex(todoList, index);

    setTodoList(newList);
  };

  return (
    <div>
      <input type="text" value={item.text} onChange={editItemText} />
      <input
        type="checkbox"
        checked={item.isComplete}
        onChange={toggleItemCompletion}
      />
      <button onClick={deleteItem}>X</button>
    </div>
  );
}

function replaceItemAtIndex(arr, index, newValue) {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
}

function removeItemAtIndex(arr, index) {
  return [...arr.slice(0, index), ...arr.slice(index + 1)];
}
```

### selector

> A selector represents a piece of derived state. You can think of derived state as the output of passing state to a pure function that modifies the given state in some way.

공식 문서에서는 `selector`가 파생된 상태(`derived state`)의 조각를 나타낸다고 말하는데, 위에 `todo list`의 예에서 `필터링된 todo list`, `todo list의 통계값` 등을 파생된 상태라고 할 수 있다.

쉽게 말해 `selector`는 `recoil`에서 관리하는 상태의 특정 부분만 선택하거나 상태를 사용하여 연산한 값을 조회할 때도 사용하면서, **다른 데이터에 의존하는 동적 데이터를 구축할 수 있게 해주는 것이다**.

[참고: [공식문서 - selector core concepts](https://recoiljs.org/docs/introduction/core-concepts/#selectors)]

## 읽기전용 selector

아래의 `selector`는 속성 계산에 사용되는 함수인 `get`만 쓰인 형태로, 상태(`atom`이나 다른 `selector`)를 조회할 수 있는 읽기 전용 `selector`이다.

당연히 읽기 전용이기 때문에 업데이트 함수를 주는 `useRecoilState`와는 사용할 수 없으며 `useRecoilValue`로만 상태를 조회해야 한다. (key는 내부적으로 `selector`를 식별하는데 사용되는 고유한 문자열이다.)

```typescript
const fontSizeLabelState = selector({
  key: 'fontSizeLabelState',
  get: ({get}) => {
    const fontSize = get(fontSizeState);
    const unit = 'px';

    return `${fontSize}${unit}`;
  },
});

function FontButton() {
  const [fontSize, setFontSize] = useRecoilState(fontSizeState);
  const fontSizeLabel = useRecoilValue(fontSizeLabelState);

  return (
    <>
      <div>Current font size: {fontSizeLabel}</div>

      <button onClick={() => setFontSize(fontSize + 1)} style={{fontSize}}>
        Click to Enlarge
      </button>
    </>
  );
}
```

읽기 전용 `selector`에서 아래와 같이 실제로 사용하는 `atom`이나 `selector`에 따라 동적으로 종속성이 결정되게 할 수도 있다.

```typescript
const toggleState = atom({key: 'Toggle', default: false});

const mySelector = selector({
  key: 'MySelector',
  get: ({get}) => {
    const toggle = get(toggleState);
    if (toggle) {
      return get(selectorA);
    } else {
      return get(selectorB);
    }
  },
});
```

## 양방향 selector

읽고 쓰기가 모두 가능한 `selector`이며, 값을 매개변수로 수신하고 이를 사용하여 데이터 흐름 그래프를 따라 업스트림으로 변경 사항을 전파할 수 있다. 또한 읽고 쓰기가 가능한 `selector`의 경우 `useRecoilState` 훅을 사용할 수 있다.

아래 예제는 추가 필드를 추가하기 위해 원자를 래핑하고, `set` 함수를 통해 업스트림 `atom`으로 전달한다.

```typescript
const proxySelector = selector({
  key: 'ProxySelector',
  get: ({get}) => ({...get(myAtom), extraField: 'hi'}),
  set: ({set}, newValue) => set(myAtom, newValue),
});
```

아래 `selector`는 데이터를 변환하므로 들어오는 값이 기본 값인지에 대한 체크를 하고 있다.

```typescript
const transformSelector = selector({
  key: 'TransformSelector',
  get: ({get}) => get(myAtom) * 100,
  set: ({set}, newValue) =>
    set(myAtom, newValue instanceof DefaultValue ? newValue : newValue / 100),
});
```

위 예제에서 `set`함수의 경우 `newValue` 값을 그대로 사용해서는 안되기 때문 `DefaultValue`의 인스턴스인지 확인하는 과정이 추가되었다. 그 이유는 selector의 상태를 기본값으로 초기화하는 `useResetRecoilState`라는 훅을 대응하기 위함이다.

좀 더 아래 있는 `TempCelsius` 예제에서도 이를 확인할 수 있다.

아래는 비동기 `selector`에 대한 간단한 예시이다.

```typescript
const myQuery = selector({
  key: 'MyQuery',
  get: async ({get}) => {
    return await myAsyncQuery(get(queryParamState));
  },
});
```

아래는 동기를 다루는 `selector`에 대한 전쳬 예시이다. [[전체 코드](https://codesandbox.io/s/recoil-sync-selector-fdlyr?file=/src/App.js)]

```typescript
import {
  atom,
  selector,
  useRecoilState,
  DefaultValue,
  useResetRecoilState,
} from 'recoil';

const tempFahrenheit = atom({
  key: 'tempFahrenheit',
  default: 32,
});

const tempCelsius = selector({
  key: 'tempCelsius',
  get: ({get}) => ((get(tempFahrenheit) - 32) * 5) / 9,
  set: ({set}, newValue) =>
    set(
      tempFahrenheit,
      newValue instanceof DefaultValue ? newValue : (newValue * 9) / 5 + 32,
    ),
});

function TempCelsius() {
  const [tempF, setTempF] = useRecoilState(tempFahrenheit);
  const [tempC, setTempC] = useRecoilState(tempCelsius);
  const resetTemp = useResetRecoilState(tempCelsius);

  const addTenCelsius = () => setTempC(tempC + 10);
  const addTenFahrenheit = () => setTempF(tempF + 10);
  const reset = () => resetTemp();

  return (
    <div>
      Temp (Celsius): {tempC}
      <br />
      Temp (Fahrenheit): {tempF}
      <br />
      <button onClick={addTenCelsius}>Add 10 Celsius</button>
      <br />
      <button onClick={addTenFahrenheit}>Add 10 Fahrenheit</button>
      <br />
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

![2021-12-10_02-16-49 (1)](https://user-images.githubusercontent.com/42884032/145448830-2055bb84-ce1b-470c-bd3f-64d5dbf733c2.gif)

아래는 비동기를 다루는 `selector`에 대한 전체 예시이다.

```typescript
import {selector, useRecoilValue} from 'recoil';

const myQuery = selector({
  key: 'MyDBQuery',
  get: async () => {
    const response = await fetch(getMyRequestUrl());
    return response.json();
  },
});

function QueryResults() {
  const queryResults = useRecoilValue(myQuery);

  return <div>{queryResults.foo}</div>;
}

function ResultsSection() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <QueryResults />
    </React.Suspense>
  );
}
```
