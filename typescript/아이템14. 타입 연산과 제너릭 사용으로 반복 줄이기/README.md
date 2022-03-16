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

태그된 유니온에서도 다른 형태의 중복이 발생할 수 있다. 단순히 태그를 붙이기 위해 타입을 사용하면 어떨지 생각해 본다. Action 유니온을 인덱싱하면 타입 반복 없이 ActionType을 정의할 수 있다.

```ts
interface SaveAction {
  type: "save";
  // ...
}
interface LoadAction {
  type: "load";
  // ...
}
type Action = SaveAction | LoadAction;
type ActionType = "save" | "load"; // Repeated types!
```

Action 유니온 타입을 더 추가하면 ActionType은 자동적으로 그 타입을 포함한다. ActionType은 Pick을 사용하여 얻게 되는 type 속성을 가지는 인터페이스와는 다르다.

```ts
type ActionType = Action["type"]; // Type is "save" | "load"

type ActionRec = Pick<Action, "type">; // {type: "save" | "load"}
```

생성하고 난 이후 업데이트가 되는 클래스를 정의한다면, update 매개변수 타입은 생성자와 동일한 매개변수이면서 타입 대부분이 선택적 필드가 된다.

```ts
interface Options {
  width: number;
  height: number;
  color: string;
  label: string;
}
interface OptionsUpdate {
  width?: number;
  height?: number;
  color?: string;
  label?: string;
}
class UIWidget {
  constructor(init: Options) {
    /* ... */
  }
  update(options: OptionsUpdate) {
    /* ... */
  }
}
```

매핑된 타입과 keyof를 사용하여 Options을 통해 OptionsUpdate 타입을 정의할 수 있다. 이때 **keyof는 타입을 받아서 속성 타입의 유니온을 반환한다.**

```ts
type Optionskeys = keyof Options; //type is "width" | "height" | "color" | "label"

type OptionsUpdate = { [k in keyof Options]?: Options[k] };
```

매핑된 타입(([key in keyof Options]))은 순회하며 Options 내 k값에 해당하는 속성이 있는 지 찾고, 이를 ?를 통해 각 속성을 선택적 필드로 만든다. 이 패턴은 아주 일반적이고, Partial이라는 이름으로 표준 라이브러리에 포함되어 있다.

```ts
type OptionsUpdate = Partial<Options>;

class UIWidget {
  constructor(init: Options) {
    /* ... */
  }
  update(options: Partial<Options>) {
    /* ... */
  }
}
```

값의 형태에 해당하는 타입을 정의하고 싶을 때도 있다. **이런 경우 typeof를 사용하면 된다.** typeof는 자바스크립트의 런타임 연산자 typeof를 사용한 것처럼 보이지만, 실제로는 타입스크립트 단계에서 연산되며 훨씬 더 정확하게 타입을 표현한다. 주의할 점은 값으로부터 타입을 만들어 낼 때는 선언의 순서에 주의해야 한다. 타입 정의를 먼저 하고 값이 그 타입에 할당 가능하다고 선언하는 것이 좋다. 이는 타입이 더 명확해지고 예상하기 어려운 타입 변동을 방지할 수 있기 위함히다.

```ts
const INIT_OPTIONS = {
  width: 640,
  height: 480,
  color: "#00FF00",
  label: "VGA",
};
interface Options {
  width: number;
  height: number;
  color: string;
  label: string;
}

type Options = typeof INIT_OPTIONS;
```

함수나 메서드의 반환 값에 명명된 타입을 만들고 싶을 수도 있다. **이러한 일반적인 패턴 또한 제네릭 타입으로 표준 라이브러리에서 제공하며 ReturnType을 사용하면 된다.** ReturnType은 함수의 값인 getUserInfo가 아니라, 함수의 타입인 typeof getUserInfo에 적용된다. 즉, typeof와 마찬가지로 이런 기법은 신중하게 사용해야 한다. 적용 대상이 값인지 타입인지 정확히 알고 구분해서 처리해야 한다.

```ts
const INIT_OPTIONS = {
  width: 640,
  height: 480,
  color: "#00FF00",
  label: "VGA",
};
function getUserInfo(userId: string) {
  // COMPRESS
  const name = "Bob";
  const age = 12;
  const height = 48;
  const weight = 70;
  const favoriteColor = "blue";
  // END
  return {
    userId,
    name,
    age,
    height,
    weight,
    favoriteColor,
  };
}
// Return type inferred as { userId: string; name: string; age: number, ... }
```

```ts
type UserInfo = ReturnType<typeof getUserInfo>;
```

제너릭 타입은 타입을 위한 함수와 같다. 함수는 코드에 대한 DRY 원칙을 지킬 때 유용하다. 따라서 타입에 대한 DRY 원칙의 핵심이 제너릭이라는 것은 어쩌면 당연해 보이는데, 간과한 부분이 있다. 함수에서 매개변수로 매핑할 수 있는 값을 제한하기 위해 타입 시스템을 사용한다. **즉, 제너릭 타입에서도 매개변수를 제한할 수 있는 방법이 필요하다.**

제너릭 타입에서 매개변수를 제한할 수 있는 방법은 extends를 사용하는 것이다. extends를 이용하면 제너릭 매개변수가 특정 타입을 확장한다고 선언할 수 있다. {first: string}은 Name을 확장하지 않기 때문에 오류가 발생한다.

```ts
interface Name {
  first: string;
  last: string;
}
type DancingDuo<T extends Name> = [T, T];

const couple1: DancingDuo<Name> = [
  { first: "Fred", last: "Astaire" },
  { first: "Ginger", last: "Rogers" },
]; // OK

const couple2: DancingDuo<{ first: string }> = [
  // ~~~~~~~~~~~~~~~
  // Property 'last' is missing in type
  // '{ first: string; }' but required in type 'Name'
  { first: "Sonny" },
  { first: "Cher" },
];
```

앞서 나온 Pick의 정의에서 설명한 예제를 실행해보면 오류가 발생한다. 이는 extends를 통해 인덱스로 사용될 수 있는 string | number | symbol이 되도록 한정되어야 하며 실제로는 범위를 조금 더 좁힐 수 있다. K는 실제로 T의 키의 부분 집합 즉, keyof T가 되어야 한다. **여기서 타입이 값의 집합이라는 점에서 생각하면 extends를 '확장'이 아니라, '부분 집합'이라는 걸 이해하는 데 도움이 된다.** 물론 Pick에 잘못된 키를 넣으면 오류가 발생해야 한다.

```ts
type Pick<T, K> = {
  [k in K]: T[k];
  // ~ 'K' 타입은 'string | number | symbol' 타입에 할당할 수 없습니다.
};

type Pick<T, K extends keyof T> = {
  [k in K]: T[k];
}; // 정상
```

```ts
type FirstLast = Pick<Name, "first" | "last">; // OK
type FirstMiddle = Pick<Name, "first" | "middle">;
// ~~~~~~~~~~~~~~~~~~
// Type '"middle"' is not assignable
// to type '"first" | "last"'
```

값의 공간에서도 마찬가지로 반복적인 코드는 타입 공간에서도 좋지 않다. 타입 공간에서 반복을 줄이려는 작업들은 프로그램 로직에서 하던 작업만큼 익숙하지 않지만 배울 만한 가치가 있으며 반복하지 않도록 주의해야 한다.
