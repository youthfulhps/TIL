# 아이템 14. 타입 연산과 제너릭 사용으로 반복 줄이기

같은 코드를 반복하지 말라는 DRY(don’t repeat yourself) 원칙은 소프트웨어 개발자라면 들어봤을 조언이다. 타입 선언에서도 이 원칙을 준수해야 한다.

타입 중복은 코드 중복만큼 많은 문제를 발생시킨다. 예를 들어 선택적 필드인 birth를 Person에 추가한다면, Person과 PersionWithBirthDate는 다른 타입이 된다.

```tsx
interface Person {
  firstName: string;
  lastName: string;
}

interface PersonWithBirthDate {
  firstName: string;
  lastName: string;
  birth?: Date;
}
```

타입 중복이 더 흔한 이유 중 하나는 공유된 패턴을 제거하는 메커니즘이 기존 코드에서 하던 것과 비교해 덜 익숙하기 때문이다. **이는 타입 간에 매핑하는 방법을 익히면, 타입 정의에서도 DRY의 장점을 적용할 수 있다.**

**반복을 줄이는 가장 간단한 방법은 타입에 이름을 붙이는 것이다.** 상수를 사용해서 반복을 줄이는 기법을 동일하게 타입 시스템에서 적용한 것이다.

```tsx
function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}
```

```tsx
interface Point2D {
  x: number;
  y: number;
}
function distance(a: Point2D, b: Point2D) {
  /* ... */
}
```

**몇몇 함수가 같은 타입 시그니처를 공유하고 있는 경우에도 해당 시그니처를 명명된 타입으로 분리할 수 있다.**

```tsx
// HIDE
interface Options {}
// END
function get(url: string, opts: Options): Promise<Response> {
  /* COMPRESS */ return Promise.resolve(new Response()); /* END */
}
function post(url: string, opts: Options): Promise<Response> {
  /* COMPRESS */ return Promise.resolve(new Response()); /* END */
}
```

```tsx
// HIDE
interface Options {}
// END
type HTTPFunction = (url: string, options: Options) => Promise<Response>;
const get: HTTPFunction = (url, options) => {
  /* COMPRESS */ return Promise.resolve(new Response()); /* END */
};
const post: HTTPFunction = (url, options) => {
  /* COMPRESS */ return Promise.resolve(new Response()); /* END */
};
```

위에서 언급한 Person/PersionWithBirthDate 예제에서는 **한 인터페이스가 다른 인터페이스를 확장하게 해서 반복을 제거할 수 있다.**

```tsx
interface Person {
  firstName: string;
  lastName: string;
}

interface PersonWithBirthDate extends Person {
  birth?: Date;
}
```

이미 존재하는 타입을 확장하는 경우에, 일반적이지는 않지만 인터섹션 연산자(&)를 사용할 수 있다. 이런 기법은 유니온 타입(확장할 수 없는)에 속성을 추가하려 할 때 특히 유용하다.

```tsx
type PersonWithBirthDate = Person & { birth?: Date };
```

가령, 전체 애플리케이션의 상태를 표현하는 State 타입과 단지 부분만 표현하는 TopNavState가 있는 경우를 살펴본다.

```tsx
interface State {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
  pageContents: string;
}
interface TopNavState {
  userId: string;
  pageTitle: string;
  recentFiles: string[];
}
```

TopNavState를 확장하여 State를 구성하기보다, State의 부분 집합으로 TopNavState를 정의하는 것이 바람직해 보인다. State를 인덱싱하여 속성의 타입에서 중복을 제거할 수 있다.

```tsx
type TopNavState = {
  userId: State["userId"];
  pageTitle: State["pageTitle"];
  recentFiles: State["recentFiles"];
};
```

**그러나, 여전히 반복되는 코드가 존재한다. 이 때 ‘매핑된 타입’을 사용하면 좀 더 나아진다.**

```tsx
type TopNavState = {
  [k in "userId" | "pageTitle" | "recentFiles"]: State[k];
};
```

**이러한 패턴은 표준 라이브러리에서도 일반적으로 찾을 수 있으며 Pick이라고 한다.** 여기서 Pick은 제너릭 타입이다. Pick을 사용하는 것은 함수를 호출하는 것과 마찬가지이며, 마치 함수에서 두 개의 매개변수 값을 받아서 결과값을 반환하는 것처럼 Pick은 T,K 두 가지 타입을 받아서 결과 타입을 반환한다.

(작성중..)
