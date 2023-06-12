# 아이템50. 오버로딩 타입보다는 조건부 타입을 사용하기

double 함수에 타입 정보를 추가해 보자. double 함수에는 string 또는 number 타입의 매개변수가 들어올 수 있어서 유니온 타입을 추가하고
함수 오버로딩 개념을 사용했다.

```js
function double(x) {
  return x + x;
}
```

```ts
function double(x: number | string): number | string;
function double(x: any) {
  return x + x;
}
```

선언이 틀린 것은 아니지만, 모호한 부분이 있다. number 타입을 매개변수로 넣으면 number를 반환,
string 타입의 매개변수를 넣으면 string을 반환하지만, 선언문은 number 타입을 매개변수로 넣어도
string 타입을 반환할 수도 있고, 그 반대도 허용된다.

제너릭을 사용해서 이러한 동작을 모델링해보자.

```ts
function double<T extends number | string>(x: T): T;
function double(x: any) {
  return x + x;
}

const num = double(12); //타입이 12
const str = double("x"); //타입이 'x'
```

이번엔 오히려 타입이 너무 과하게 구체적이다. string 타입을 매개변수로 넘기면 string 타입이 반환되어야
하지만, 리터럴 문자열 'x' 타입이 반환된다.

또 다른 방법은 여러 가지 타입 선언으로 분리하는 것이다. 타입스크립트에서 함수의 구현체는 하나지만,
타입 선언은 몇 개든지 만들 수 있으므로, 이를 통해 double 타입을 개선할 수 있다.

```ts
function double(x: number): number;
function double(x: string): string;
function double(x: any) {
  return x + x;
}

const num = double(12); //타입이 number
const str = double("x"); //타입이 string
```

함수 타입이 조금 명확해졌지만, 여전히 버그는 남아있는데, 유니온 타입 관련해서 문제가 발생한다.

```ts
function f(x: number | string) {
  return double(x);
  // ~ Argument of type 'string | number' is not assignable
  //   to parameter of type 'string'
}
```

참고로, 타입스크립트는 오버로딩 타입 중에서 일치하는 타입을 찾을 때까지 순차적으로 검색한다.
그래서 오러보딩 타입의 마지막 선언(string 버전)까지 검색했을 때, `string|number` 타입은 string에
할당할 수 없기 때문에 오류가 발생한다.

그렇다면, `string|number` 버전의 타입 선언도 오버로딩하면 되겠지만 가장 좋은 해결책은
조건부 타입(conditional type)을 사용하는 것이다.

조건부 타입은 타입 공간의 if 구문과 같다.

```ts
function double<T extends number | string>(
  x: T
): T extends string ? string : number;
function double(x: any) {
  return x + x;
}
```

제너릭과 유사하지만, 반환 타입이 더 정교하다. 조건부 타입은 자바스크립트의 삼항 연산자처럼 사용할 수 있다.

- T가 string의 부분 집합(string, 문자열 리터럴, 문자열 리터럴의 유니온)이면 반환 타입이 string
- 그 외의 경우는 반환타입이 number

유니온에 조건부 타입을 적용하면, 조건부 타입의 유니온으로 분리되기 때문에 number|string 경우에도
문제없이 동작한다. 예를 들어 T가 number|string이라면, 타입스크립트는 아래와 같이 해석된다.

```ts
(number|string) extends string ? string : number
-> (number extends string ? string : number) |
   (string extends string ? string : number)
-> number | string
```

오버로딩 타입이 작성하기는 쉽지만, 조건부 타입은 개별 타입의 유니온으로 일반화하기 때문에
타입이 더 정확해진다. 타입 오버로딩이 필요한 경우에 가끔 조건부 타입이 필요한 상황이 발생하는데
조건부 타입은 타입 체커가 단일 표현식으로 받아들이기 때문에 유니온 문제를 해결할 수 있다.

결론적으로 오버로딩 타입을 사용한다면, 오버로딩 없이 유니온 타입을 지원하는 조건부 타입을 고려해볼 수 있다.
