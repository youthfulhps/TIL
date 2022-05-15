# 아이템48. API 주석에 TSDoc 사용하기

인사말을 생성하는 타입스크립트 함수이다. 함수 앞부분에 주석이 있어서 함수가 어떤 기능을 하는지
쉽게 알 수 있다. 하지만, 사용자를 위한 문서라면 JSDoc 스타일의 주석으로 만드는 것이 좋다.

```ts
// Generate a greeting. Result is formatted for display.
function greet(name: string, title: string) {
  return `Hello ${title} ${name}`;
}
```

```ts
/** Generate a greeting. Result is formatted for display. */
function greetJSDoc(name: string, title: string) {
  return `Hello ${title} ${name}`;
}
```

크게 차이가 없어 보이지만, 대부분의 편집기는 함수가 호출되는 곳에서 함수에 붙어 있는
JSDoc 스타일의 주석을 툴팁으로 표시해주기 때문이다. 그러나 인라인 주석은 편집기에서
표시해주지 않기 때문에 JSDoc 스타일의 주석을 추천한다.

타입스크립트 언어 시스템 또한 JSDoc 스타일을 지원하기 때문에 적극적으로 활용하는 것이 좋다.
만약 공개 API 주석을 붙인다면 JSDoc 형태로 작성해야 하며,
JSDoc의 @param, @return 같은 일반적인 규칙을 사용하여 작성하면 더욱 효과적이다.

한편 타입스크립트에서는 TSDoc이라고 부른다.

```ts
/**
 * Generate a greeting.
 * @param name Name of the person to greet
 * @param salutation The person's title
 * @returns A greeting formatted for human consumption.
 */
function greetFullTSDoc(name: string, title: string) {
  return `Hello ${title} ${name}`;
}
```

또한, 타입 정의에서도 TSDoc 스타일의 주석을 달 수 있으며, Measurement 객체의
각 필드에 마우스를 올려 보면 필드별로 설명을 볼 수 있다.

```ts
interface Vector3D {}
/** A measurement performed at a time and place. */
interface Measurement {
  /** Where was the measurement made? */
  position: Vector3D;
  /** When was the measurement made? In seconds since epoch. */
  time: number;
  /** Observed momentum */
  momentum: Vector3D;
}
```

TSDoc 주석은 마크다운 형식으로 꾸며지기 때문에 주석을 여러 텍스트 스타일로 입혀 제공할 수 있다.
하지만 주석을 수필처럼 장황하게 쓰지 않도록 주의해야 하며 간단히 요점만 표현하는 주석이
가장 좋은 주석이다.

```ts
/**
 * This _interface_ has **three** properties:
 * 1. x
 * 2. y
 * 3. z
 */
interface Vector3D {
  x: number;
  y: number;
  z: number;
}
```

JSDoc에는 타입 정보를 명시하는 규칙 (`@param {string} name...`)이 있지만,
타입스크립트에서는 타입 정보가 코드에 있기 때문에 TSDoc에서는 타입 정보를 명시하면 안된다.
