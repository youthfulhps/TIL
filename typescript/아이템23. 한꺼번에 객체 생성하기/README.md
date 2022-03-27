# 아이템23. 한꺼번에 객체 생성하기

변수의 값은 변경될 수 있지만, 타입스크립트의 타입은 일반적으로 변경되지 않는다. 이러한 특성은 일부 자바스크립트 패턴을 타입스크립트로 모델링하기 쉬워진다.
__즉, 객체를 생성할 대는 속성을 하나씩 추가하기 보다는 여러 속성을 포함해서 생성할 때 한꺼번에 모든 속성을 포함하여 생성하는 것이 타입 추론에 유리하다.__

자바스크립트에서 2차원 점을 표현하는 객체를 생성하는 방법이다. 하지만, 타입스크립트에서는 할당문에서 모두 오류가 발생한다.

```js
const pt = {};
pt.x = 3;
pt.y = 4;
```
```ts
const pt = {};
pt.x = 3;
// ~ Property 'x' does not exist on type '{}'
pt.y = 4;
// ~ Property 'y' does not exist on type '{}'
```

첫 번째 줄의 pt 타입은 {}값을 기준으로 추론되기 때문에 존재하지 않는 속성을 추가할 수는 없다. 만약, 인터페이스를 명시해준다면 오류가 변경된다.

```ts
interface Point { x: number; y: number; }
const pt: Point = {};
   // ~~ Type '{}' is missing the following properties from type 'Point': x, y
pt.x = 3;
pt.y = 4;
```

이러한 오류들은 객체를 한번에 정의하는 것으로 해결할 수 있다.
```ts
interface Point { x: number; y: number; }
const pt = {
  x: 3,
  y: 4,
};  // OK
```

객체를 반드시 나누어 만들어야 한다면, 타입 단언문을 사용할 수 있지만, 이 경우에도 선언할 때 객체를 한꺼번에 만드는 게 낫다.

```ts
interface Point { x: number; y: number; }
const pt = {} as Point;
pt.x = 3;
pt.y = 4;  // OK
```

작은 객체들의 조합을 통해 큰 객체를 만들어야 한다면, 여러 단계를 거쳐 할당하기 보다는 '객체 전개 연산자' ...를 사용하여 큰 객체를 만들어 내는 것이 낫다.
객체 전개 연산자를 사용하면 타입 걱정 없이 필드 단위로 객체를 생성할 수도 있다. 모든 업데이트마다 새 변수를 사용하여 각각 새로운 타입을 얻도록 하는 것이 중요하다.

```ts
interface Point { x: number; y: number; }
const pt = {x: 3, y: 4};
const id = {name: 'Pythagoras'};
const namedPoint = {};
Object.assign(namedPoint, pt, id);
namedPoint.name;
        // ~~~~ Property 'name' does not exist on type '{}'
```

```ts
interface Point { x: number; y: number; }
const pt = {x: 3, y: 4};
const id = {name: 'Pythagoras'};
const namedPoint = {...pt, ...id};
namedPoint.name;  // OK, type is string
```

객체의 속성을 추가하고 타입스크립트가 새로운 타입 추론을 할 수 있게 해 유용하다. 
```ts
interface Point { x: number; y: number; }
const pt0 = {};
const pt1 = {...pt0, x: 3};
const pt: Point = {...pt1, y: 4};  // OK
```

타입에 안전한 방식으로 조건부 속성을 추가하려면, 속성을 추가하지 않는 null 또는 {}으로 객체 전개를 사용하면 된다. 물론, 객체 전개 연산자로 여러 속성을 추가할 수도 있다.
```ts
declare let hasMiddle: boolean;
const firstLast = {first: 'Harry', last: 'Truman'};
const president = {...firstLast, ...(hasMiddle ? {middle: 'S'} : {})};
```

```ts
declare let hasDates: boolean;
const nameTitle = {name: 'Khufu', title: 'Pharaoh'};
const pharaoh = {
  ...nameTitle,
  ...(hasDates ? {start: -2589, end: -2566}: {})
}
```

편집기에서는 pharaoh는 이제 유니온으로 추론되는데, 이 경우 start와 end가 항상 함께 정의되기 때문에 이 점을 고려하면 유니온을 사용하는 게 가능한 값의 집합을 
더 정확히 표현할 수 있다. 하지만, 유니온보다는 선택적 필드가 다루기에는 더 쉬울 수 있다. 선택적 필드 방식으로 표현하려면 다음 핼퍼 함수를 사용하면 된다.
```ts
const pharaoh: {
  start: number;
  end: number;
  name: string;
  title: string;
} | {
  name: string;
  title: string;
}
```

```ts
declare let hasMiddle: boolean;
const firstLast = {first: 'Harry', last: 'Truman'};
function addOptional<T extends object, U extends object>(
  a: T, b: U | null
): T & Partial<U> {
  return {...a, ...b};
}

const president = addOptional(firstLast, hasMiddle ? {middle: 'S'} : null);
president.middle  // OK, type is string | undefined

```




