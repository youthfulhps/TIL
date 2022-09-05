# 아이템42. 모르는 타입의 값에는 any 대신 unknown을 사용하기

`unknown`에 대해서 알아보자. **unknown은 함수의 반환값, 변수 선언, 단언문과 관련된 형태가 있다.**
`unknown`과 유사하지만, 조금 다른 형태도 살펴보자.

(1)함수 반환값과 관련된 `unknown`을 알아보자. YAML 파서인 parseYAML 함수를 작성한다면 JSON.parse의 반환 타입과
동일하게 parseYAML 메서드의 반환 타입을 any로 만들어보자.

```ts
function parseYAML(yaml: string): any {
  // ...
}
```

아이템 38에서 이야기 했듯이 함수의 반환 타입으로 `any`를 사용하는 것은 좋지 않은 설계이다.
대신 parseYAML를 호출한 곳에서 반환값을 원하는 타입으로 할당하는 것이 이상적이다.

```ts
interface Book {
  name: string;
  author: string;
}
const book: Book = parseYAML(`
  name: Wuthering Heights
  author: Emily Brontë
`);
```

그러나, 함수의 반환값에 타입 선언을 강제할 수 없기 때문에, 호출한 곳에서 타입 선언을 생략하게 되면
book 변수는 암시적 `any` 타입이 되고, 사용되는 곳 마다 타입 오류가 발생하게 된다.

```ts
alert(book.title); // No error, alerts "undefined" at runtime
book("read"); // No error, throws "TypeError: book is not a
// function" at runtime
```

대신 parseYAML이 `unknown` 타입을 반환하게 만드는 것이 더 안전하다.

```ts
function safeParseYAML(yaml: string): unknown {
  return parseYAML(yaml);
}
const book = safeParseYAML(`
  name: Villette
  author: Charlotte Brontë
`) as Book;
alert(book.title);
// ~~~~~ Property 'title' does not exist on type 'Book'
book("read");
// ~~~~~~~~~ this expression is not callable
```

`unknown` 타입을 이해하기 위해서는 할당 가능성 관점에서 any를 생각해 볼 필요가 있다.
`any`가 강력하면서도 위험한 이유는 다음 두 가지 특징으로부터 비롯된다.

- 어떠한 타입이든 `any` 타입에 할당 가능하다.
- `any` 타입은 어떠한 타입으로도 할당 가능하다.

'타입을 값의 집합으로 생각하기'의 관점에서 한 집합은 다른 모든 집합의 부분 집합이면서
동시에 상위집합이 될 수 없기 때문에 분명히 `any`는 타입 시스템과 상충되는 면을 가지고 있다.
이러한 점이 `any`의 강력함의 원천이면서 동시에 문제를 일으키는 원인이 된다.
**타입 체커는 집합 기반이기 때문에 `any`를 사용하면 타입 체커가 무용지물이 된다는 것을 주의해야 한다.**

`unknown` 타입은 `any` 대신 사용할 수 있는 타입 시스템에 부합하는 타입이다.
`unknown` 타입은 앞에서 언급한 `any`의 첫 번째 속성을 만족하지만, 두 번째 속성은 만족하지 않는다.
**즉, 어떤 타입이든 `unknown`에 할당 가능하지만, `unknown`은 오직 `unknown`과 `any`에만 할당가능하다.**

한편 `unknown` 타입인 채로 값을 사용하면 오류가 발생한다. `unknown`인 값에 함수를 호출하거나 연산을 하려고 해도
마찬가지이다. `unknown` 상태로 사용하려고 하면 오류가 발생하기 때문에 적절한 타입으로 변환하도록 강제할 수 있다.

```ts
const book = safeParseYAML(`
  name: Villette
  author: Charlotte Brontë
`) as Book;
alert(book.title);
// ~~~~~ Property 'title' does not exist on type 'Book'
book("read");
// ~~~~~~~~~ this expression is not callable
```

함수의 반환 타입인 `unknown` 그대로 값을 사용할 수 없기 때문에 Book으로 타입 단언을 해야 한다.
애초에 반환값이 Book이라고 기대하며 함수를 호출하기 때문에 단언문은 문제가 되지 않는다.
그리고, Book 타입 기준으로 타입 체크가 되기 때문에, `unknown` 타입 기준으로 오류를 표시했던
예제보다 오류의 정보가 정확하다.

(2)다음으로 변수 선언과 관련된 `unknown`을 알아보자. 어떠한 값이 있지만, 그 타입을 모르는 경우에
`unknown`을 사용한다. 예를 들어, GeoJSON 사양에서 Feature의 properties 속성은 JSON 직렬화가
가능한 모든 것을 담는 잡동사니 주머니같은 존재이다. 그래서 타입을 예상할 수 없기 때문에 `unknown`로 사용한다.

```ts
interface Feature {
  id?: string | number;
  geometry: Geometry;
  properties: unknown;
}
```

타입 단언문이 `unknown`에서 원하는 타입으로 반환하는 유일한 방법은 아니다. **instanceof를 체크한 후
`unknown`에서 원하는 타입으로도 변환이 가능하다.**

```ts
function processValue(val: unknown) {
  if (val instanceof Date) {
    val; // Type is Date
  }
}
```

또한, 정의 타입 가드도 `unknown`에서 원하는 타입으로 변환할 수 있다.
`unknown` 타입의 범위를 좁히기 위해서는 많은 노력이 필요하다. in 연산자에서 오류를 피하기 위해 먼저 val이 객체임을 확인하고,
`typeof null === 'object'` 이므로 별도의 val이 null 아님을 확인해야 한다.

```ts
function isBook(val: unknown): val is Book {
  return (
    typeof val === "object" && val !== null && "name" in val && "author" in val
  );
}
function processValue(val: unknown) {
  if (isBook(val)) {
    val; // Type is Book
  }
}
```

가끔 `unknown` 대신 제너릭 매개변수가 사용되는 경우가 있다. 제너릭을 사용하기 위해 다음 코드처럼 safeParseYAML 함수를 선언할 수 있다.

```ts
function safeParseYAML<T>(yaml: string): T {
  return parseYAML(yaml);
}
```

그러나, 앞의 코드는 일반적으로 타입스크립트에서 좋지 않은 스타일이다. 제너릭을 사용한 스타일은 타입 단언문과 달라 보이지만,
기능적으로는 동일하다. **제너릭보다는 `unknown`을 반환하고 사용자가 직접 단언문을 사용하거나 원하는 대로 타입을 좁히도록
강제하는 것이 좋다.**

(3)다음으로 단언문과 관련된 `unknown`을 알아보자. 이중 단언문에서 `any` 대신 `unknown`을 사용할 수도 있다.

```ts
declare const foo: Foo;
let barAny = foo as any as Bar;
let barUnk = foo as unknown as Bar;
```

barAny, barUnk는 기능적으로 동일하지만, 나중에 두 개의 단언문을 분리하는 리팩터링을 한다면 `unknown` 형태가
더 안전하다. `any`의 경우는 분리되는 순간 그 영향력이 전염병처럼 퍼지게 된다. 그러나, `unknown`의 경우는 분리되는 즉시
오류를 발생하게 되므로 더 안전하다.

(4)마지막으로 `unknown`과 유사하지만, 조금 다른 타입들도 알아보자. 이번 아이템에서 `unknown`에 대해서 설명한 것과
비슷한 방식으로 `object` 또는 {}를 사용하는 코드들이 존재한다. `object` 또는 {}를 사용하는 방법 역시 `unknown`
만큼 범위가 넓은 타입이지만, `unknown`보다는 범위가 약간 좁다.

- {} 타입은 `null`과 `undefined`를 제외한 모든 값을 포함한다.
- object 타입은 모든 비기본형 타입으로 이루어진다. 여기에는 true 또는 12 또는 "foo"가 포함되지 않지만,
  객체와 배열은 포함된다.

`unknown` 타입이 도입되기 전에는 {}가 더 일반적으로 사용되었지만, 최근에는 {}을 사용하는 경우가 꽤 드물다.
정말로 null과 undefined가 불가능하다고 판단되는 경우만 unknown 대신 {}를 사용하면 된다.
