# 아이템52. 테스팅 타입의 함정에 주의하기

프로젝트를 공개하려면 테스트 코드를 작성하는 것은 필수이며,
타입선언에도 테스트를 거쳐야 한다. 그러나 타입 선언을 테스트하기에는 매우 어렵다.

결국, 테스트 시 타입 단언문을 사용하는 경우가 많지만, 많은 문제들이 도사리고 있다.

궁극적으로는 dtslint 또는 타입 시스템 외부에서 타입을 검사하는 유사한 도구를
사용하는 것이 안전하고 간단하다.

map 함수의 타입 선언을 작성한다고 가정해보자.

```ts
declare function map<U, V>(array: U[], fn: (u: U) => V): V[];
```

타입 선언이 예상한 타입으로 결과를 내는지 체크할 수 있는 한 가지 방법은
함수를 호출하는 테스트 파일을 작성하는 것이지만 허점이 존재한다.

```ts
map(["2017", "2018", "2019"], (v) => Number(v));
```

map의 첫 번째 매개변수에 배열이 아닌 단일 값이 있었다면,
매개변수의 타입에 대한 오류는 잡을 수 있다. 그러나 반환값에 대한
체크가 누락되어 있기 때문에 완전한 테스트라고 할 수 없다.

동일한 케이스로 square 함수의 런타임 동작을 테스트한다면
다음과 같은 테스트 코드가 된다.

```ts
test("square a number", () => {
  square(1);
  square(2);
});
```

이 테스트 코드는 square 함수의 '실행'에서 오류가 발생하지 않는지만
체크한다. 그런데, 반환값에 대해서는 체크하지 않기 때문에
실제로는 실행의 결과에 대한 테스트는 하지 않는 것이 된다.
따라서, square 함수의 구현이 잘못되어도 테스트는 통과하게 된다.

**함수를 실행하는 테스트 코드가 의미 없는 것은 아니지만,
실제로 반환 타입을 체크하는 것이 훨씬 좋은 테스트 코드이다.**

반환값을 특정 타입의 변수에 할당하여 간단히 반환 타입을 체크할 수 있는
방법이 있다.

```ts
const lengths: number[] = map(["john", "paul"], (name) => name.length);
```

`number[]`를 lengths 변수의 타입으로 명시한 것은 일반적으로
불필요한 타입 선언에 해당하지만, 테스트 코드 관점에서는 중요한 역할을 하고 있다.
number[] 타입 선언은 map 함수의 반환 타입이 number[]임을 보장한다.

실제도 DefinitelyTyped에도 테스팅을 위해 위와 같은 방법을 사용하는 케이스들이 많다.
하지만, 테스팅을 위해 타입을 할당하는 방법에도 두 가지 문제점이 있다.

- 불필요한 변수를 만들어야 한다.

미사용 변수에 대한 경고를 피하기 위해 린팅 규칙을 임시 비활성화해야 한다.
그래서, 일반적인 해결책은 변수를 도입하는 대신 헬퍼 함수를 정의한다.

```ts
function assertType<T>(x: T) {}

assertType<number[]>(map(["john", "paul"], (name) => name.length));
```

하지만, 두 번째 문제가 남아있다.

- 두 타입이 동일한지 체크하는 것이 아니라 할당 가능성을
  체크하고 있다.

```ts
const n = 12;
assertType<number>(n); //good
```

그러나, 객체의 타입을 체크하는 경우를 살펴보면 문제를
발견하게 된다.

```ts
const beatles = ["john", "paul", "george", "ringo"];
assertType<{ name: string }[]>(
  map(beatles, (name) => ({
    name,
    inYellowSubmarine: name === "ringo",
  }))
); // OK
```

게다가, assertType에 함수를 넣어보면 이상한 결과가 나타난다.
**함수는 매개변수가 더 적은 함수 타입에 할당 가능하기 때문이다.**

```ts
function assertType<T>(x: T) {}
const add = (a: number, b: number) => a + b;
assertType<(a: number, b: number) => number>(add); // OK

const double = (x: number) => 2 * x;
assertType<(a: number, b: number) => number>(double); // OK!?
```

```ts
const g: (x: string) => any = () => 12; //OK!?
```

다시 assertType 문제로 돌아와 제대로 된 사용 방법을 적용해보자.
다음 코드 처럼 `Parameters`와 `ReturnType` 제너릭 타입을
이용해 함수의 매개변수 타입과 반환 타입만 분리하여 테스트할 수 있다.

```ts
const double = (x: number) => 2 * x;

// 매개변수 타입 체크
let p: Parameters<typeof double> = null!;
assertType<[number, number]>(p);
//                           ~ Argument of type '[number]' is not
//                             assignable to parameter of type [number, number]
// 반환 타입 체크
let r: ReturnType<typeof double> = null!;
assertType<number>(r); // OK
```

타입 시스템 내에서 암시적 any 타입을 발견해내는 것 또한 매우 어렵다.
결국, 타입 체커와 독립적으로 동작하는 도구를 사용해서 타입 선언을 테스트하는
방법이 권장된다.

DefinitelyTyped의 타입 선언을 위한 도구는 dtslint이다.
dtslint는 특별한 형태의 주석을 통해 동작한다.
dtslint를 사용하면 beatles 관련 예제의 테스트를 다음처럼 작성할 수 있다.

```ts
declare function map<U, V>(
  array: U[],
  fn: (this: U[], u: U, i: number, array: U[]) => V
): V[];
const beatles = ["john", "paul", "george", "ringo"];
map(
  beatles,
  function (
    name, // $ExpectType string
    i, // $ExpectType number
    array // $ExpectType string[]
  ) {
    this; // $ExpectType string[]
    return name.length;
  }
); // $ExpectType number[]
```

dtslint는 할당 가능성을 체크하는 대신 각 심벌의 타입을 추출하여
글자 자체가 같은 지 비교한다.

dtslint의 비교 과정은 편집기에서 타입 선언을 눈으로 보고 확인하는 것 같은데,
dtslint는 이를 자동화한다.
여전히 number|string, string|number는 같은 타입이지만, 글자로 비교했을 때
차이가 있기 때문에 다른 타입으로 인식된다.

타입 선언을 테스트한다는 것은 어렵지만 반드시 해야 하는 작업이다.
앞에서 소개한 몇 가지 일반적인 기법의 문제점을 인지하고,
문제점을 방지하기 위해 dtslint 같은 도구를 사용하자.
