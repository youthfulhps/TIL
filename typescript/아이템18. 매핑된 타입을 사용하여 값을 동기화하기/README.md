# 아이템 18. 매핑된 타입을 사용하여 값을 동기화하기

산점도를 그리기 위한 UI 컴포넌트를 작성한다고 가정했을 때 디스플레이와 동작을 제어하기 위한 몇 가지 다른 타입의 속성이 포함된다.

```ts
interface ScatterProps {
  // The data
  xs: number[];
  ys: number[];

  // Display
  xRange: [number, number];
  yRange: [number, number];
  color: string;

  // Events
  onClick: (x: number, y: number, index: number) => void;
}
```

데이터나 디스플레이 속성이 변경되면 다시 그려야 하지만, 이벤트 핸들러가 변경되면 다시 그릴 필요가 없다.
이런 종류의 최적화는 리액트 컴포넌트에서는 일반적인데, 랜더링할 때마다 이벤트 핸들러 prop이 새 화살표 함수로 설정된다.

최적화를 두 가지 방법으로 진행해보자. 만약 새로운 속성이 추가되면 shouldUpdate 함수는 값이 변경될 때마다 차트를 다시 그릴 것이다. 이렇게 처리하는 것을 '보수적' 혹은 '실패에 닫힌' 접근법 이라고 한다. 하지만, 이러한 접근법을 이용하면 차트가 정확하지만 너무 자주 그려질 가능성이 있다.

```ts
function shouldUpdate(oldProps: ScatterProps, newProps: ScatterProps) {
  let k: keyof ScatterProps;
  for (k in oldProps) {
    if (oldProps[k] !== newProps[k]) {
      if (k !== "onClick") return true;
    }
  }
  return false;
}
```

두 번째 최적화 방법은 '실패에 열린' 접근법이다. 이 코드는 차트를 불필요하게 다시 그리는 단점을 해결했다. 하지만, 차트를 다시 그려야 할 경우에 누락되는 일이 생길 수 있다. 이는 히포크라테스 전집에 나오는 원칙 중 하나인 '우선, 망치지 말 것(first, do no harm)'을 어기기 때문에 일반적으로 쓰이는 방법은 아니다.

```ts
function shouldUpdate(oldProps: ScatterProps, newProps: ScatterProps) {
  return (
    oldProps.xs !== newProps.xs ||
    oldProps.ys !== newProps.ys ||
    oldProps.xRange !== newProps.xRange ||
    oldProps.yRange !== newProps.yRange ||
    oldProps.color !== newProps.color
    // (no check for onClick)
  );
}
```

앞선 두 가지 최적화 방법은 모두 이상적이지 않다. 결국 새로운 속성이 추가될 때 직접 shouldUpdate를 고치도록 하는 게 낫다. 이를 주석으로 표현한다.

```ts
interface ScatterProps {
  // The data
  xs: number[];
  ys: number[];

  // Display
  xRange: [number, number];
  yRange: [number, number];
  color: string;

  // Events
  onClick: (x: number, y: number, index: number) => void;
}
interface ScatterProps {
  xs: number[];
  ys: number[];
  // ...
  onClick: (x: number, y: number, index: number) => void;

  // Note: if you add a property here, update shouldUpdate!
}
```

그러나, 이 방법 역시 최선이 아니며, 타입 체커에게 이를 대신 할 수 있도록 하는 것이 좋다.
타입 체커가 동작하도록 개선한 코드이다. **여기서 핵심은 매핑된 타입과 객체를 사용하는 것이다.**

```ts
const REQUIRES_UPDATE: { [k in keyof ScatterProps]: boolean } = {
  xs: true,
  ys: true,
  xRange: true,
  yRange: true,
  color: true,
  onClick: false,
};

function shouldUpdate(oldProps: ScatterProps, newProps: ScatterProps) {
  let k: keyof ScatterProps;
  for (k in oldProps) {
    if (oldProps[k] !== newProps[k] && REQUIRES_UPDATE[k]) {
      return true;
    }
  }
  return false;
}
```

코드를 하나씩 살펴보자. `[k in keyof ScatterProps]`는 타입 체커에게 `REQUIRES_UPDATE`가 `ScatterProps과` 동일한 속성을 가져야 한다는 정보를 제공한다. 나중에 `ScatterProps`에 새로운 속성을 추가하는 경우 다음 코드와 같은 형태가 될 것이다.
그리고, `REQUIRES_UPDATE`의 정의에 오류가 발생한다.

```ts
interface ScatterProps {
  // ...
  onDoubleClick: () => void;
}
const REQUIRES_UPDATE: { [k in keyof ScatterProps]: boolean } = {
  //  ~~~~~~~~~~~~~~~ Property 'onDoubleClick' is missing in type
  // COMPRESS
  xs: true,
  ys: true,
  xRange: true,
  yRange: true,
  color: true,
  onClick: false,
  // END
};
```

이런 방식은 속성을 삭제하거나, 이름을 바꾸어도 비슷한 오류를 발생시킨다. **여기서, boolean 값을 가진 객체를 사용했다는 점이 중요하다.**
**매핑된 타입은 한 객체가 또 다른 객체와 정확히 같은 속성을 가지게 할 때 이상적이다.** 이번 예제처럼 **매핑된 타입을 사용해 타입스크립트가 코드에 제약을 강제하도록 할 수 있다.**
