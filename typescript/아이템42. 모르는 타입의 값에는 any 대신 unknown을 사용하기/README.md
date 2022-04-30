# 아이템42. 모르는 타입의 값에는 any 대신 unknown을 사용하기

`unknown`에 대해서 알아보자. **unknown은 함수의 반환값, 변수 선언, 단언문과 관련된 형태가 있다.**
`unknown`과 유사하지만, 조금 다른 형태도 살펴보자.

함수 반환값과 관련된 `unknown`을 알아보자. YAML 파서인 parseYAML 함수를 작성한다면 JSON.parse의 반환 타입과
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
