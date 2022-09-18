# Memoization

보통 어플리케이션에서 최적화를 위해 메모이제이션을 한다.
이전의 계산한 값을 메모리에 저장해두고, 동일하게 다시 사용할 수 있는 곳에서
재사용하여 반복적으로 발생하는 계산의 리소스를 줄이고자 함이다.

리엑트에서도 메모이제이션을 통해 랜더링을 최적화할 수 있는데, 리엑트에서
메모이제이션을 쉽게 구현할 수 있도록 제공하는 대표적인 API(`useMemo`, `useCallback`, `React.memo`)
들을 제공한다.

하지만, 메모이제이션 API들을 사용하기 위해서 코드가 늘어나게 되는데,
결국 늘어난 코드만큼 비용 또한 추가 발생한다. 개인적으로 관련 참조값이
메모이제이션되어 있을 것이라는 전제가 깔려있지 않고 어떤 이슈를 디버깅했을 때
'왜 안바뀌지?' 하면서 꼭 여러번 삽질을 했던 경우가 있어 오히려 익숙치 않다면
디버깅에 방해가 되는 요소가 될 수도 있다.

그래도, 충분히 복잡한 연산에 대해 성능상의 이점을 누릴 수 있기 때문에
자주 일어나는 컴포넌트나, 반복되는 복잡한 연산 과정에 잘 이해하고 적절히
사용할 줄 알아야 한다. 두서 없는 글이긴 하지만, 일단 구현체들을 살펴보고,
어떻게 사용할 수 있을 지 하나 씩 정리해보자.

## HooksDispatcher

메모이제이션에 사용되는 훅을 살펴보기 전에 먼저 리엑트 내부에서 공유되는
[훅 디스패처](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.new.js#L2599)
를 간략하게 살펴보면, 우리가 자주 사용하는 훅의 구현체들을 확인해볼 수 있다.

```js
const HooksDispatcher...: Dispatcher = {
  readContext,

  useCallback: updateCallback,
  useContext: readContext,
  useEffect: updateEffect,
  useImperativeHandle: updateImperativeHandle,
  useInsertionEffect: updateInsertionEffect,
  useLayoutEffect: updateLayoutEffect,
  useMemo: updateMemo,
  useReducer: updateReducer,
  useRef: updateRef,
  useState: updateState,
  useDebugValue: updateDebugValue,
  useDeferredValue: updateDeferredValue,
  useTransition: updateTransition,
  useMutableSource: updateMutableSource,
  useSyncExternalStore: updateSyncExternalStore,
  useId: updateId,

  unstable_isNewReconciler: enableNewReconciler,
};
```

`HooksDispatcher` 라는 객체명 뒤에 왜 `...` 을 붙였냐면,
`HooksDispatcher`가 세 가지 케이스별로 각각 구분되어 구현되어
있기 때문인데, 각각 `onMount`, `onRenderer`, `onUpdate` 키워드가
붙어있기 때문인데, 우선 각각 상황에 따라 어떤 `HookDispatcher`가
사용되겠거니 짐작하고 넘어가보자.

```js
const HooksDispatcherOnMount: Dispatcher = {...}
const HooksDispatcherOnRerender: Dispatcher = {...}
const HooksDispatcherOnUpdate: Dispatcher = {...}
```

## Hook

리엑트 내부에서 훅은 `Hook`이라는 인터페이스를 가진 객체를 통해 관리된다.

```ts
export type Hook = {
  memoizedState: any,
  baseState: any,
  baseQueue: Update<any, any> | null,
  queue: any,
  next: Hook | null,
};
```

## useMemo, useCallback

`useMemo()`, `useCallback()`은 모두 리엑트에서 메모이제이션을 쉽게
구현할 수 있도록 도와주는 훅 API이다.

`useMemo()`는 콜백 함수의 연산된 결과값을 메모이제이션하는 반면,
`useCallback()`은 콜백 함수 자체를 메모이제이션한다. 

[react/packages/react-reconciler/ReactFiberHooks.new.js](https://github.com/facebook/react/blob/main/packages/react-reconciler/src/ReactFiberHooks.new.js)에서의 `useMemo()`, `useCallback()`의 구현체들을 살펴보자.

리엑트 내부에서 공유되는 훅 디스패처는 랜더링, 업데이트용이 각각
구현되어 있는데, 여기서 `useMemo()`는 내부적으로 `udpateMemo()` 이라는
함수의 반환값을 구현체로 사용하고, `useCallback()`의 경우 `updateCallback()`
이라는 함수의 반환값을 구현체로 사용한다.

```js
const HooksDispatcher...: Dispatcher = {
  ...
  useCallback: updateCallback,
  useMemo: updateMemo,
  ...
}
```

```js
function updateMemo<T>(
  nextCreate: () => T,
  deps: Array<mixed> | void | null,
): T {
  const hook = updateWorkInProgressHook();
  // hook, 업데이트 및 랜더 단계 업데이트로 츠리거된 랜더 모두에 사용된다.
  // 인터페이스는 위에서 언급한 Hook!
  // 현재 훅을 복사할 수 있거나 이전 혹은 사용되고 있는 훅이 있다면,
  // 이를 가져와 사용하거나, 새로운 newHook 객체를 구현하여 사용한다.
  const nextDeps = deps === undefined ? null : deps;
  // nextDeps, useMemo의 deps로서 전달하는 배열
  const prevState = hook.memoizedState;
  // prevState, 이전 혹은 사용되고 있는 훅에서 그러니까..
  // 이전 랜더링 과정에서 사용된 hook 객체에서 메모이제이션된 상태값
  if (prevState !== null) {
    // 만약, 이전 랜더링 과정에서 사용된 hook의 메모이제이션된 값이 있다면,
    if (nextDeps !== null) {
      // 그리고, deps가 null이 아니라면, 
      // * 여기서 prevState의 생김새는 = [value, deps];
      const prevDeps: Array<mixed> | null = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 만약, nextDeps, prevDeps가 동일하면,
        return prevState[0];
      }
    }
  }

  // 이전 메모이제이션된 값이 없다면,
  const nextValue = nextCreate();
  // useMemo의 콜백 함수를 연산한 value와 deps를 메모이제이션에 담는다.
  hook.memoizedState = [nextValue, nextDeps];
  return nextValue;
}
```

여기서, `areHookInputsEqual()`의 대략적인 반환 로직은 다음과 같다.

```ts
function is(x: any, y: any) {
  return (
    (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y)
  );
}

function areHookInputsEqual(
  nextDeps: Array<mixed>,
  prevDeps: Array<mixed> | null,
) {
  ...
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```

`updateMemo()`의 주석을 우리가 이론적으로 알고 있는 `useMemo()`의
사용법과 동작에 대응시켜 정리해보면, 결국 랜더, 업데이트에 트리거되었을 때
**`useMemo()`의 deps가 이전의 deps 값들과 비교하여 변경사항이 있다면,
콜백으로 전달받은 함수를 새롭게 연산하여 메모이제이션한다. 반대로 변경사항이 없다면,
이전의 사용된 값과 deps가 반환된다.**

`updateCallback()`도 `hook.memoization`에 함수 자체를 담아내는 것
말고는 큰 차이가 없다.

```ts
function updateCallback<T>(callback: T, deps: Array<mixed> | void | null): T {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  const prevState = hook.memoizedState;
  if (prevState !== null) {
    if (nextDeps !== null) {
      const prevDeps: Array<mixed> | null = prevState[1];
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        return prevState[0];
      }
    }
  }

  // callback 자체를 담는다.
  hook.memoizedState = [callback, nextDeps];
  return callback;
}
```

(작성 중...)
